import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior legal fact-checker with 25 years of experience at a top AmLaw 100 firm. You have personally verified thousands of AI-generated legal documents submitted to courts, regulatory agencies, and corporate transactions. You identify every verifiable claim with surgical precision, catch hallucinated citations immediately, know when legal standards have changed, and provide analysis at the level of a partner review — not an associate review. Your verdicts have prevented malpractice claims and saved careers.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Your task is to perform an exhaustive legal accuracy audit. For each claim identify:
- Whether it is Verified (accurate, well-established current law), Unverified (may be true but cannot be confirmed), Hallucination (factually wrong, cites non-existent law or cases), or Outdated (was accurate but law has changed)
- The exact source of truth for verified claims
- The correct statement for wrong or outdated claims

Compute an overall trust score 0–100:
90–100: All or nearly all claims verified, no hallucinations
70–89: Mostly verified with minor unverified claims
40–69: Mix of verified and problematic claims
10–39: Multiple hallucinations or significant legal errors
0–9: Pervasive fabrications, legally dangerous

Respond ONLY with this exact JSON structure:

{
  "trustScore": <number 0-100>,
  "verdict": "<Trustworthy | Questionable | Unreliable>",
  "jurisdiction": "<primary jurisdiction, e.g. Federal, California, Multi-jurisdictional>",
  "summary": "<2-3 sentence executive summary of overall document quality and key concerns>",
  "recommendation": "<1-2 sentence direct recommendation for what to do with this document — use it, fix it, or reject it, and why>",
  "claims": [
    {
      "text": "<exact quote of the claim from the document>",
      "type": "<statute | case_citation | regulatory_claim | legal_standard | factual_assertion | date_claim | jurisdiction_claim>",
      "verdict": "<Verified | Unverified | Hallucination | Outdated>",
      "status": "<Verified | Unverified | Hallucination | Outdated>",
      "confidence": <number 0-100>,
      "source": "<the authoritative source that confirms or contradicts this claim, e.g. specific statute, case reporter, or agency publication>",
      "explanation": "<1-2 sentence explanation of your verdict>",
      "severity": "<low | medium | high>",
      "correction": "<accurate current statement, or null if the claim is correct>",
      "closestRealCase": "<closest real case name and citation if this is a hallucinated citation, or null>",
      "jurisdiction": "<specific jurisdiction for this claim>"
    }
  ],
  "riskFlags": [
    "<brief description of a specific legal risk or concern in this document>"
  ],
  "recommendedActions": [
    "<specific actionable step a legal professional should take>"
  ]
}`

async function verifyWithCourtListener(claims) {
  const caseClaims = claims
    .map((claim, idx) => ({ claim, idx }))
    .filter(({ claim }) => claim.type === 'case_citation')
    .slice(0, 5)

  if (caseClaims.length === 0) return claims

  const results = await Promise.allSettled(
    caseClaims.map(async ({ claim, idx }) => {
      const nameMatch = claim.text.match(/([A-Z][^,]+(?:\s+v\.?\s+|\s+vs\.?\s+)[^,\d]+?)(?:,|$)/)
      const caseName  = nameMatch ? nameMatch[1].trim() : claim.text.substring(0, 80)
      const encoded   = encodeURIComponent(caseName)
      const controller = new AbortController()
      const timeout    = setTimeout(() => controller.abort(), 4000)
      try {
        const res = await fetch(
          `https://www.courtlistener.com/api/rest/v4/search/?type=o&q=${encoded}&format=json`,
          { signal: controller.signal, headers: { 'User-Agent': 'TrustLayer/1.0' } }
        )
        clearTimeout(timeout)
        if (!res.ok) return { idx, url: null }
        const data = await res.json()
        if (data.results?.length > 0) {
          const hit = data.results[0]
          return { idx, url: hit.absolute_url ? `https://www.courtlistener.com${hit.absolute_url}` : null }
        }
        return { idx, url: null }
      } catch {
        clearTimeout(timeout)
        return { idx, url: null }
      }
    })
  )

  const enriched = [...claims]
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.url) {
      const { idx, url } = result.value
      enriched[idx] = { ...enriched[idx], courtListenerUrl: url }
    }
  }
  return enriched
}

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Invalid input: text field is required' }, { status: 400 })
    }
    if (text.trim().length < 20) {
      return Response.json({ error: 'Text too short for meaningful analysis' }, { status: 400 })
    }
    if (text.length > 50000) {
      return Response.json({ error: 'Text exceeds maximum length of 50,000 characters' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Analyze the following legal text for accuracy, hallucinations, and trustworthiness:\n\n---\n${text}\n---`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        trustScore: 0,
        verdict: 'Unreliable',
        summary: 'Analysis could not be completed — the AI response was unparseable.',
        recommendation: 'Please try again with a shorter or simpler document.',
        claims: [],
        riskFlags: ['Analysis failed — treat this document with extreme caution'],
        recommendedActions: ['Retry the analysis', 'Manually review all legal citations'],
        parseError: true,
        raw: raw.slice(0, 500),
      })
    }

    if (parsed.claims?.length > 0) {
      parsed.claims = await verifyWithCourtListener(parsed.claims)
    }

    return Response.json({
      ...parsed,
      usage: {
        inputTokens:         response.usage.input_tokens,
        outputTokens:        response.usage.output_tokens,
        cacheReadTokens:     response.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
      },
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: 'Invalid API key — set ANTHROPIC_API_KEY' }, { status: 401 })
    if (error instanceof Anthropic.RateLimitError)      return Response.json({ error: 'Rate limit exceeded — please try again shortly' }, { status: 429 })
    if (error instanceof Anthropic.APIError)            return Response.json({ error: `API error: ${error.message}` }, { status: error.status ?? 500 })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
