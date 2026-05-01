import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a tenant rights attorney with 20 years of experience protecting renters and commercial tenants. You always advocate for the tenant's interests, flag landlord-friendly traps, and arm tenants with the knowledge to negotiate fair terms or know when to walk away.

When analyzing a lease, you:
1. Summarize key terms in plain language
2. Translate confusing clauses into plain English
3. Identify tenant rights specific to the stated jurisdiction
4. Flag red flags and dangerous clauses with severity levels
5. Identify negotiation opportunities where tenants commonly win concessions
6. Generate questions the tenant should ask before signing
7. Score the lease for fairness from the tenant's perspective

IMPORTANT: Return ONLY valid JSON in exactly this format — no prose, no markdown, no code fences:

{
  "summary": {
    "address": "<property address if found, else null>",
    "landlord": "<landlord/property manager name if found, else null>",
    "tenant": "<tenant name if found, else null>",
    "rent": "<monthly rent amount and due date>",
    "deposit": "<security deposit amount and conditions>",
    "leaseStart": "<lease start date>",
    "leaseEnd": "<lease end date or term length>",
    "notice": "<required notice period to vacate>",
    "petPolicy": "<pet policy summary>",
    "utilities": "<who pays for which utilities>"
  },
  "clauses": [
    {
      "title": "<clause name>",
      "originalLanguage": "<direct quote from lease or null if not found>",
      "plainEnglish": "<what this means in simple language>",
      "impact": "<positive | neutral | negative>"
    }
  ],
  "tenantRights": {
    "state": "<state name>",
    "depositReturn": "<days landlord has to return deposit + cite statute>",
    "noticePeriod": "<required notice to raise rent or terminate + statute>",
    "habitability": "<implied warranty of habitability rules>",
    "retaliation": "<anti-retaliation protections>",
    "earlyTermination": "<tenant's rights to break lease early>"
  },
  "redFlags": [
    {
      "clause": "<clause name or location>",
      "issue": "<one-line description of the problem>",
      "severity": "<high | medium | low>",
      "explanation": "<2-3 sentences explaining why this is a problem and what it could cost the tenant>"
    }
  ],
  "negotiationOpportunities": [
    {
      "clause": "<clause name>",
      "currentLanguage": "<what the lease currently says>",
      "suggested": "<suggested replacement or addition>",
      "rationale": "<why landlords often agree to this change>"
    }
  ],
  "questionsToAsk": [
    "<specific question the tenant should ask the landlord before signing>"
  ],
  "fairnessScore": {
    "score": <0-100 integer — 100 is maximally tenant-favorable, 0 is maximally landlord-favorable>,
    "rating": "<Excellent | Good | Fair | Concerning | Dangerous>",
    "explanation": "<2-3 sentences explaining the score>",
    "keyReasons": ["<reason score is what it is>", "<another reason>"]
  }
}`

export async function POST(request) {
  try {
    const { lease, leaseType, state } = await request.json()

    if (!lease || typeof lease !== 'string' || lease.trim().length < 100) {
      return Response.json({ error: 'Lease text too short — paste at least 100 characters of your lease' }, { status: 400 })
    }
    if (lease.length > 50000) {
      return Response.json({ error: 'Lease text too long — maximum 50,000 characters' }, { status: 400 })
    }
    if (!state || typeof state !== 'string' || !state.trim()) {
      return Response.json({ error: 'State is required' }, { status: 400 })
    }

    const leaseTypeLabel = leaseType === 'commercial' ? 'Commercial' : 'Residential'
    const stateNote = `\n\nJURISDICTION: ${state}. Apply ${state}-specific tenant rights laws, rent control rules, security deposit statutes, and habitability standards throughout your analysis.`
    const typeNote = `\n\nLEASE TYPE: ${leaseTypeLabel}. ${leaseType === 'commercial' ? 'Apply commercial lease standards. Note that commercial tenants have fewer statutory protections than residential tenants — flag this throughout.' : 'Apply residential tenant protections fully.'}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: `${SYSTEM_PROMPT}${stateNote}${typeNote}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Analyze this ${leaseTypeLabel.toLowerCase()} lease agreement and return your complete analysis as JSON.\n\nLease:\n---\n${lease}\n---`,
        },
      ],
    })

    const raw = response.content[0]?.text ?? ''

    let parsed
    try {
      const m = raw.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(m ? m[0] : raw)
    } catch {
      return Response.json({ error: 'Failed to parse AI response', raw }, { status: 502 })
    }

    return Response.json({
      ...parsed,
      usage: {
        inputTokens:     response.usage.input_tokens,
        outputTokens:    response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      },
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: 'Invalid API key' }, { status: 401 })
    if (error instanceof Anthropic.RateLimitError)      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    if (error instanceof Anthropic.APIError)            return Response.json({ error: `API error: ${error.message}` }, { status: error.status ?? 500 })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
