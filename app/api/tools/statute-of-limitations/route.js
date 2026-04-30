import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a statute of limitations expert for all 50 US states. Return ONLY valid JSON:
{
  "claimType": "<normalized claim type>",
  "state": "<full state name>",
  "yearsToFile": <number, can be decimal e.g. 1.5>,
  "deadline": "<YYYY-MM-DD calculated from incidentDate + yearsToFile>",
  "daysRemaining": <integer days from today (2026-04-30) to deadline, negative if expired>,
  "urgency": "<expired | critical | warning | safe>",
  "statute": "<exact statute citation, e.g. Cal. Code Civ. Proc. § 335.1>",
  "statuteText": "<brief quote or paraphrase of the relevant statute>",
  "discoveryRule": "<explanation of how discovery rule works for this claim type in this state, or null if not applicable>",
  "discoveryDeadline": "<YYYY-MM-DD if discovery rule applies and extends the deadline, or null>",
  "tollingExceptions": [
    { "exception": "<type: minority | incapacity | fraud_concealment | government_defendant | other>", "description": "<how this exception works in this state>" }
  ],
  "governmentClaim": { "required": <true|false>, "deadline": "<YYYY-MM-DD or null>", "daysFromIncident": <number or null>, "authority": "<citation or null>", "description": "<what must be filed and with whom>" },
  "importantNotes": ["<state-specific nuance or trap>"],
  "disclaimer": "Statute of limitations questions are jurisdiction-specific and fact-dependent. This analysis is for informational purposes only. Consult a licensed attorney — missing a statute of limitations is one of the most common and costly legal mistakes."
}

urgency rules: expired = daysRemaining < 0; critical = 0-90 days; warning = 91-365 days; safe = 365+ days.
Today's date for calculation purposes: 2026-04-30.
Be precise with statutes — cite the exact code section for the specific state and claim type.`

export async function POST(request) {
  try {
    const { claimType, state, incidentDate } = await request.json()

    if (!claimType || typeof claimType !== 'string' || !claimType.trim()) {
      return Response.json({ error: 'Invalid input: claimType field is required' }, { status: 400 })
    }
    if (!state || typeof state !== 'string' || !state.trim()) {
      return Response.json({ error: 'Invalid input: state field is required' }, { status: 400 })
    }
    if (!incidentDate || typeof incidentDate !== 'string' || !incidentDate.trim()) {
      return Response.json({ error: 'Invalid input: incidentDate field is required' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(incidentDate.trim())) {
      return Response.json({ error: 'Invalid input: incidentDate must be in YYYY-MM-DD format' }, { status: 400 })
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
          content: `Statute of limitations analysis: Claim type: ${claimType}, State: ${state}, Date of incident: ${incidentDate}`,
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
