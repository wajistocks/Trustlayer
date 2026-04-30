import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a senior legal research specialist with 25 years of experience covering federal courts, all 50 state jurisdictions, federal and state statutes, administrative regulations, and precedent analysis. You have deep expertise in Westlaw and LexisNexis research methodology.

Your task is to respond to legal research queries with structured, accurate results. For each research mode, return well-sourced findings with appropriate confidence scores based on your knowledge certainty.

IMPORTANT: Only cite cases, statutes, and regulations that you are highly confident actually exist. If you are uncertain about a specific citation, lower the confidence score and note the uncertainty. Never fabricate citations.

RESPOND with ONLY valid JSON in exactly this format — no prose, no markdown, no code fences:

{
  "results": [
    {
      "id": "<unique string>",
      "title": "<case name, statute title, or regulation name>",
      "citation": "<full legal citation>",
      "url": null,
      "summary": "<2-3 sentence plain English explanation of what this authority says and why it matters>",
      "jurisdiction": "<Federal | specific state | specific circuit>",
      "date": "<YYYY or YYYY-MM-DD>",
      "relevance": <0-100 integer — how directly relevant to the query>,
      "confidence": <0-100 integer — your certainty this citation is accurate>,
      "type": "<case | statute | regulation | restatement>",
      "keyPoints": ["<concise takeaway>", "<concise takeaway>"],
      "practiceArea": "<e.g. Contract Law, Employment, Securities, IP>",
      "outcome": "<for cases only: plaintiff-favorable | defendant-favorable | mixed | procedural | null>",
      "status": "<Good law | Overruled | Distinguished | Superseded | Current | null>"
    }
  ],
  "totalFound": <integer>,
  "summary": "<2-3 sentence overview of the research landscape for this query>",
  "researchNotes": "<1-2 sentence practitioner note — circuit splits, recent developments, jurisdiction-specific warnings>"
}`

const MODE_INSTRUCTIONS = {
  case_law: `You are in CASE LAW SEARCH mode. Return 5-8 real court decisions most relevant to the query. Include federal and state cases as appropriate. Rank by relevance. Include the case outcome and current precedential status. Focus on landmark cases and recent controlling authority.`,

  statute: `You are in STATUTE LOOKUP mode. Return 4-6 real federal or state statutory provisions most relevant to the query. Include the exact code section, the effective date, and any major amendments. Note if a statute has been superseded or amended recently. Provide the plain English meaning of each provision.`,

  precedent: `You are in PRECEDENT ANALYSIS mode. Return 5-7 cases that establish, apply, refine, or limit the legal principle in the query. Organize from foundational precedent to recent applications. Highlight circuit splits or state law variations. Explain what each case adds to the doctrine.`,

  regulatory: `You are in REGULATORY RESEARCH mode. Return 4-6 real regulatory provisions, agency rules, guidance documents, or administrative decisions relevant to the query. Include CFR sections, agency release numbers, and effective dates. Note if regulations are currently under rulemaking or have been recently amended.`,
}

async function searchCourtListener(query, jurisdiction) {
  const encoded = encodeURIComponent(query)
  const jurisdictionParam = jurisdiction && jurisdiction !== 'all'
    ? `&jurisdiction=${encodeURIComponent(jurisdiction)}`
    : ''

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(
      `https://www.courtlistener.com/api/rest/v4/search/?type=o&q=${encoded}${jurisdictionParam}&format=json&page_size=8`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'TrustLayer/1.0' },
      }
    )
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map(hit => ({
      id: `cl-${hit.id ?? Math.random().toString(36).slice(2)}`,
      title: hit.caseName ?? hit.case_name ?? 'Unknown Case',
      citation: hit.citation ?? (hit.citations?.[0]?.cite ?? null),
      url: hit.absolute_url
        ? `https://www.courtlistener.com${hit.absolute_url}`
        : null,
      summary: hit.snippet ?? hit.text ?? null,
      jurisdiction: hit.court ?? hit.court_id ?? 'Federal',
      date: hit.dateFiled ?? hit.date_filed ?? null,
      relevance: 90,
      confidence: 95,
      type: 'case',
      keyPoints: [],
      practiceArea: null,
      outcome: null,
      status: 'Good law',
      source: 'CourtListener',
    }))
  } catch {
    clearTimeout(timeout)
    return []
  }
}

export async function POST(request) {
  try {
    const { query, mode, jurisdiction } = await request.json()

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return Response.json({ error: 'Query too short' }, { status: 400 })
    }
    if (query.length > 500) {
      return Response.json({ error: 'Query too long (max 500 characters)' }, { status: 400 })
    }

    const validModes = ['case_law', 'statute', 'precedent', 'regulatory']
    const researchMode = validModes.includes(mode) ? mode : 'case_law'

    const jurisdictionNote = jurisdiction && jurisdiction !== 'all'
      ? `\n\nJURISDICTION FILTER: Focus on ${jurisdiction} law. Include directly controlling federal authority when relevant.`
      : ''

    const modeInstruction = MODE_INSTRUCTIONS[researchMode]

    const [claudeResponse, courtListenerResults] = await Promise.allSettled([
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [
          {
            type: 'text',
            text: `${SYSTEM_PROMPT}\n\n${modeInstruction}`,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: `Research query: "${query}"${jurisdictionNote}\n\nProvide comprehensive legal research results.`,
          },
        ],
      }),
      researchMode === 'case_law' ? searchCourtListener(query, jurisdiction) : Promise.resolve([]),
    ])

    let aiResults = []
    let summary = ''
    let researchNotes = ''
    let totalFound = 0

    if (claudeResponse.status === 'fulfilled') {
      const raw = claudeResponse.value.content[0]?.text ?? ''
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
        aiResults = (parsed.results ?? []).map((r, i) => ({ ...r, id: r.id ?? `ai-${i}` }))
        summary = parsed.summary ?? ''
        researchNotes = parsed.researchNotes ?? ''
        totalFound = parsed.totalFound ?? aiResults.length
      } catch {
        // fall through to CourtListener-only results
      }
    }

    // Merge CourtListener real cases, deduplicating by title similarity
    let clResults = courtListenerResults.status === 'fulfilled' ? courtListenerResults.value : []
    if (clResults.length > 0) {
      const aiTitles = new Set(aiResults.map(r => r.title.toLowerCase().slice(0, 20)))
      const novel = clResults.filter(r => !aiTitles.has(r.title.toLowerCase().slice(0, 20)))
      // Enrich AI results that match CourtListener hits with real URLs
      aiResults = aiResults.map(r => {
        const match = clResults.find(cl =>
          cl.title.toLowerCase().includes(r.title.toLowerCase().split(' v.')[0]?.trim().toLowerCase() ?? '')
        )
        return match ? { ...r, url: match.url ?? r.url } : r
      })
      clResults = novel.slice(0, 3)
    }

    const allResults = [...aiResults, ...clResults]
      .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))

    return Response.json({
      results: allResults,
      totalFound: totalFound + clResults.length,
      summary,
      researchNotes,
      mode: researchMode,
      query,
      jurisdiction: jurisdiction ?? 'all',
      usage: claudeResponse.status === 'fulfilled' ? {
        inputTokens: claudeResponse.value.usage.input_tokens,
        outputTokens: claudeResponse.value.usage.output_tokens,
        cacheReadTokens: claudeResponse.value.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: claudeResponse.value.usage.cache_creation_input_tokens ?? 0,
      } : null,
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: 'Invalid API key — set ANTHROPIC_API_KEY' }, { status: 401 })
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'Rate limit exceeded — please try again shortly' }, { status: 429 })
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `API error: ${error.message}` }, { status: error.status ?? 500 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
