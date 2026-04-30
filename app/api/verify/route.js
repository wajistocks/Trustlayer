import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a senior legal fact-checker and AI hallucination detection specialist with 20 years of experience spanning federal and state courts, contract law, securities regulation, intellectual property, employment law, and regulatory compliance. You have served as an expert witness in legal malpractice cases involving AI-generated documents.

Your mission is to perform an exhaustive legal accuracy audit of the submitted text. You must:

1. IDENTIFY every verifiable claim — this includes:
   - Case citations (federal and state court decisions, including circuit, district, and appellate courts)
   - Statutory references (U.S. Code sections, state codes, administrative codes)
   - Regulatory citations (CFR sections, agency rules, SEC releases, FTC regulations, staff bulletins, advisory opinions)
   - Legal standards and doctrines (tests, burdens of proof, common law rules, restatement provisions)
   - Dates, thresholds, dollar amounts, and numerical values with legal significance
   - Jurisdiction-specific claims (state law, federal circuit splits, conflict of laws)
   - Representations about legal rights, obligations, and consequences

2. CLASSIFY each claim by type using exactly one of:
   - "statute" — reference to a specific code section or legislative provision
   - "case_citation" — reference to a court decision by name and/or citation
   - "regulatory_claim" — reference to an agency rule, release, bulletin, or guidance
   - "legal_standard" — a stated legal test, doctrine, or burden of proof
   - "factual_assertion" — a stated fact with legal significance (amounts, dates, thresholds)
   - "date_claim" — a specific date or temporal assertion about when law changed
   - "jurisdiction_claim" — an assertion about what law governs or where jurisdiction lies

3. SCORE each claim using exactly one verdict:
   - "Verified" — accurate, well-established, consistent with current law as of your knowledge cutoff
   - "Unverified" — may be true but cannot be confirmed without additional sources or context
   - "Hallucination" — factually wrong, cites non-existent law or cases, contradicts established legal principles, or is legally impossible
   - "Outdated" — was accurate but the law, regulation, or standard has since materially changed

4. FOR EACH CLAIM also provide:
   - confidence: integer 0–100 reflecting your certainty in the verdict
   - correction: if the claim is wrong or outdated, the accurate current statement; null if the claim is correct
   - closestRealCase: if the claim is a hallucinated or misidentified case citation, the name and citation of the closest real case the author may have confused it with; null otherwise
   - jurisdiction: the specific jurisdiction this claim applies to (e.g., "Federal", "9th Circuit", "California", "Delaware Chancery Court", "New York")

5. DETECT the document's primary jurisdiction from context and apply jurisdiction-specific analysis. Note if the document mixes jurisdictions incorrectly.

6. COMPUTE an overall trust score 0–100:
   - 90–100: All or nearly all claims verified, no hallucinations
   - 70–89: Mostly verified with minor unverified claims only
   - 40–69: Mix of verified and problematic claims, some errors
   - 10–39: Multiple hallucinations or significant legal errors
   - 0–9: Pervasive fabrications, legally dangerous document

7. PROVIDE 2–5 recommended actions — specific, actionable steps a legal professional should take to address the issues found.

RESPOND with ONLY valid JSON in this exact format — no prose, no markdown, no code fences, no explanation outside the JSON:

{
  "trustScore": <number 0-100>,
  "verdict": "<Trustworthy | Uncertain | High Risk>",
  "jurisdiction": "<primary jurisdiction, e.g. 'Federal', 'California', 'Multi-jurisdictional', 'Delaware'>",
  "summary": "<2-3 sentence executive summary of overall document quality and key concerns>",
  "recommendedActions": [
    "<specific actionable step for a legal professional>"
  ],
  "claims": [
    {
      "text": "<exact quote of the claim from the document>",
      "type": "<statute | case_citation | regulatory_claim | legal_standard | factual_assertion | date_claim | jurisdiction_claim>",
      "verdict": "<Verified | Unverified | Hallucination | Outdated>",
      "confidence": <number 0-100>,
      "explanation": "<1-2 sentence explanation of your verdict>",
      "severity": "<low | medium | high>",
      "correction": "<accurate current statement, or null>",
      "closestRealCase": "<closest real case name and citation if this is a hallucinated or misidentified citation, or null>",
      "jurisdiction": "<specific jurisdiction for this claim>"
    }
  ],
  "riskFlags": [
    "<brief description of a specific legal risk or concern>"
  ]
}

Be exhaustive. Every hallucinated citation, misquoted statute, and outdated regulation represents a potential malpractice claim. Do not invent verdicts — if a claim is genuinely ambiguous, mark it Unverified and explain why.`

async function verifyWithCourtListener(claims) {
  const caseClaims = claims
    .map((claim, idx) => ({ claim, idx }))
    .filter(({ claim }) => claim.type === 'case_citation')
    .slice(0, 5)

  if (caseClaims.length === 0) return claims

  const results = await Promise.allSettled(
    caseClaims.map(async ({ claim, idx }) => {
      const nameMatch = claim.text.match(/([A-Z][^,]+(?:\s+v\.?\s+|\s+vs\.?\s+)[^,\d]+?)(?:,|$)/)
      const caseName = nameMatch ? nameMatch[1].trim() : claim.text.substring(0, 80)
      const encoded = encodeURIComponent(caseName)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4000)

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
          const url = hit.absolute_url
            ? `https://www.courtlistener.com${hit.absolute_url}`
            : null
          return { idx, url }
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
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Analyze the following legal text for accuracy, hallucinations, and trustworthiness:\n\n---\n${text}\n---`,
        },
      ],
    })

    const raw = response.content[0]?.text ?? ''

    let parsed
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
    } catch {
      return Response.json({ error: 'Failed to parse AI response', raw }, { status: 502 })
    }

    if (parsed.claims?.length > 0) {
      parsed.claims = await verifyWithCourtListener(parsed.claims)
    }

    return Response.json({
      ...parsed,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
      },
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
