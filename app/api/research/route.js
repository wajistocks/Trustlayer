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

// ── CourtListener ────────────────────────────────────────────────────────────
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
      { signal: controller.signal, headers: { 'User-Agent': 'TrustLayer/1.0' } }
    )
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map(hit => ({
      id: `cl-${hit.id ?? Math.random().toString(36).slice(2)}`,
      title: hit.caseName ?? hit.case_name ?? 'Unknown Case',
      citation: hit.citation ?? (hit.citations?.[0]?.cite ?? null),
      url: hit.absolute_url ? `https://www.courtlistener.com${hit.absolute_url}` : null,
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

// ── Congress.gov ─────────────────────────────────────────────────────────────
async function searchCongress(query) {
  const apiKey = process.env.CONGRESS_API_KEY
  if (!apiKey) return []

  const encoded = encodeURIComponent(query)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(
      `https://api.congress.gov/v3/bill?api_key=${apiKey}&format=json&limit=5&query=${encoded}`,
      { signal: controller.signal, headers: { 'User-Agent': 'TrustLayer/1.0' } }
    )
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()

    return (data.bills ?? []).map(bill => {
      const type = bill.type ?? ''
      const num  = bill.number ?? ''
      const cong = bill.congress ?? ''

      // Build human-readable Congress.gov URL
      const chamberSlug =
        type === 'HR'   ? 'house-bill'
        : type === 'S'  ? 'senate-bill'
        : type === 'HJRES' ? 'house-joint-resolution'
        : type === 'SJRES' ? 'senate-joint-resolution'
        : type === 'HRES'  ? 'house-resolution'
        : type === 'SRES'  ? 'senate-resolution'
        : type.toLowerCase() + '-bill'

      const humanUrl = cong && type && num
        ? `https://www.congress.gov/bill/${cong}th-congress/${chamberSlug}/${num}`
        : null

      return {
        billNumber:   `${type}${num}`,
        title:        bill.title ?? 'Untitled Bill',
        congress:     cong ? `${cong}th Congress` : null,
        latestAction: bill.latestAction?.text ?? null,
        actionDate:   bill.latestAction?.actionDate ?? null,
        chamber:      bill.originChamber ?? null,
        updateDate:   bill.updateDate ?? null,
        url:          humanUrl,
      }
    })
  } catch {
    clearTimeout(timeout)
    return []
  }
}

// ── OpenStates ───────────────────────────────────────────────────────────────
async function searchOpenStates(query, jurisdiction) {
  const apiKey = process.env.OPENSTATES_API_KEY
  if (!apiKey) return []

  const encoded = encodeURIComponent(query)

  // Map TrustLayer jurisdiction values to OpenStates jurisdiction param
  const stateMap = {
    california: 'California', 'new-york': 'New York', texas: 'Texas',
    florida: 'Florida', illinois: 'Illinois', pennsylvania: 'Pennsylvania',
    ohio: 'Ohio', georgia: 'Georgia', washington: 'Washington',
    massachusetts: 'Massachusetts', virginia: 'Virginia', colorado: 'Colorado',
    arizona: 'Arizona', nevada: 'Nevada', delaware: 'Delaware',
  }
  const stateJuris = stateMap[jurisdiction]
  const jurisdParam = stateJuris
    ? `&jurisdiction=${encodeURIComponent(stateJuris)}`
    : '&jurisdiction=us'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(
      `https://v3.openstates.org/bills?apikey=${apiKey}&q=${encoded}${jurisdParam}&per_page=5`,
      { signal: controller.signal, headers: { 'User-Agent': 'TrustLayer/1.0' } }
    )
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()

    return (data.results ?? []).map(bill => ({
      identifier:    bill.identifier ?? 'Unknown',
      title:         bill.title ?? 'Untitled Bill',
      state:         bill.jurisdiction?.name ?? null,
      status:        bill.latest_action_description ?? null,
      updatedAt:     bill.updated_at ? bill.updated_at.slice(0, 10) : null,
      session:       bill.session ?? null,
      url:           bill.openstates_url ?? null,
    }))
  } catch {
    clearTimeout(timeout)
    return []
  }
}

// ── Federal Register ─────────────────────────────────────────────────────────
async function searchFederalRegister(query) {
  const encoded = encodeURIComponent(query)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(
      `https://www.federalregister.gov/api/v1/documents.json?conditions[term]=${encoded}&per_page=5`,
      { signal: controller.signal, headers: { 'User-Agent': 'TrustLayer/1.0' } }
    )
    clearTimeout(timeout)
    if (!res.ok) return []
    const data = await res.json()

    return (data.results ?? []).map(doc => ({
      title:           doc.title ?? 'Untitled Document',
      agencies:        doc.agency_names ?? [],
      publicationDate: doc.publication_date ?? null,
      documentType:    doc.type ?? null,
      documentNumber:  doc.document_number ?? null,
      abstract:        doc.abstract ?? null,
      url:             doc.html_url ?? null,
    }))
  } catch {
    clearTimeout(timeout)
    return []
  }
}

// ── POST handler ─────────────────────────────────────────────────────────────
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

    // Run all five sources in parallel — none can block the others
    const [
      claudeResponse,
      courtListenerResults,
      congressResults,
      openStatesResults,
      fedRegResults,
    ] = await Promise.allSettled([
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
      searchCongress(query),
      searchOpenStates(query, jurisdiction),
      searchFederalRegister(query),
    ])

    // ── Parse Claude response ────────────────────────────────────────────────
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
        // fall through
      }
    }

    // ── Merge CourtListener results ──────────────────────────────────────────
    let clResults = courtListenerResults.status === 'fulfilled' ? courtListenerResults.value : []
    if (clResults.length > 0) {
      const aiTitles = new Set(aiResults.map(r => r.title.toLowerCase().slice(0, 20)))
      const novel = clResults.filter(r => !aiTitles.has(r.title.toLowerCase().slice(0, 20)))
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
      results:            allResults,
      totalFound:         totalFound + clResults.length,
      summary,
      researchNotes,
      mode:               researchMode,
      query,
      jurisdiction:       jurisdiction ?? 'all',
      // New live data sources
      federalLegislation: congressResults.status === 'fulfilled' ? congressResults.value : [],
      stateLegislation:   openStatesResults.status === 'fulfilled' ? openStatesResults.value : [],
      federalRegulations: fedRegResults.status === 'fulfilled' ? fedRegResults.value : [],
      usage: claudeResponse.status === 'fulfilled' ? {
        inputTokens:        claudeResponse.value.usage.input_tokens,
        outputTokens:       claudeResponse.value.usage.output_tokens,
        cacheReadTokens:    claudeResponse.value.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens:claudeResponse.value.usage.cache_creation_input_tokens ?? 0,
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
