import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior litigation attorney with encyclopedic knowledge of statute of limitations rules across all 50 states and federal courts. You have 25 years of experience and have handled cases where the difference between winning and losing was knowing an obscure tolling exception or discovery rule. You know every tolling provision, every discovery rule, every minority toll, every government tort claim deadline, and every special circumstance that affects filing deadlines. Missing a statute of limitations is one of the most common forms of legal malpractice — your analysis prevents that.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Return this exact JSON:

{
  "claimType": "<normalized claim type>",
  "state": "<full state name>",
  "yearsToFile": <number — can be decimal, e.g. 1.5 for 18 months>,
  "deadline": "<YYYY-MM-DD calculated from incidentDate + yearsToFile>",
  "daysRemaining": <integer days from today (2026-05-01) to deadline — negative if already expired>,
  "urgency": "<expired | critical | warning | safe>",
  "statute": "<exact statute citation, e.g. Cal. Code Civ. Proc. § 335.1>",
  "statuteText": "<brief quote or paraphrase of the relevant statutory language>",
  "discoveryRule": "<explanation of how the discovery rule applies for this claim type in this state — when does the clock start: at the injury, at discovery, or at the reasonable discovery date? Or null if not applicable>",
  "discoveryDeadline": "<YYYY-MM-DD if discovery rule potentially extends the deadline, or null>",
  "tollingExceptions": [
    {
      "exception": "<minority | incapacity | fraud_concealment | government_defendant | bankruptcy | active_military | other>",
      "description": "<exactly how this exception works in this state for this claim type, including any caps on the extension>"
    }
  ],
  "governmentClaim": {
    "required": <true | false>,
    "deadline": "<YYYY-MM-DD or null>",
    "daysFromIncident": <number or null>,
    "authority": "<statute or regulation citation or null>",
    "description": "<what must be filed, with whom, in what form, and what happens if missed>"
  },
  "importantNotes": [
    "<state-specific nuance, trap, or important fact about this claim type in this state>"
  ],
  "disclaimer": "Statute of limitations questions are jurisdiction-specific and fact-dependent. This analysis is for informational purposes only. Consult a licensed attorney immediately — missing a statute of limitations is one of the most common and costly legal mistakes, and there is no remedy once the deadline has passed."
}

Urgency rules: expired = daysRemaining < 0; critical = 0-90 days remaining; warning = 91-365 days; safe = 365+ days.
Today's date for calculation: 2026-05-01.
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
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Calculate statute of limitations for this matter and return as JSON.\n\nClaim type: ${claimType}\nState: ${state}\nDate of incident: ${incidentDate}`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        claimType,
        state,
        yearsToFile: null,
        deadline: null,
        daysRemaining: null,
        urgency: 'critical',
        statute: null,
        statuteText: null,
        discoveryRule: null,
        discoveryDeadline: null,
        tollingExceptions: [],
        governmentClaim: { required: false, deadline: null, daysFromIncident: null, authority: null, description: null },
        importantNotes: ['Analysis failed. Consult an attorney immediately — do not miss your filing deadline.'],
        disclaimer: 'Analysis failed. Consult a licensed attorney immediately regarding your filing deadline.',
        parseError: true,
        raw: raw.slice(0, 500),
      })
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
