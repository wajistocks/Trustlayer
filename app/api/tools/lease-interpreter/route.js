import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior tenant rights attorney with 25 years of experience specializing in residential and commercial lease law across all 50 states. You have reviewed thousands of leases. You always advocate fiercely for the tenant's interests, identify every clause that harms tenants, know exactly which clauses are illegal or unenforceable in which states, and explain everything in plain English that a non-lawyer can immediately understand and act on. Your clients have avoided devastating lease traps because of your expertise.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Analyze this lease and return this exact JSON:

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
      "originalLanguage": "<direct quote from lease or null>",
      "plainEnglish": "<what this means in simple language a non-lawyer can act on>",
      "impact": "<positive | neutral | negative>"
    }
  ],
  "tenantRights": {
    "state": "<state name>",
    "depositReturn": "<days landlord has to return deposit + cite exact statute>",
    "noticePeriod": "<required notice to raise rent or terminate + exact statute>",
    "habitability": "<implied warranty of habitability rules in this state>",
    "retaliation": "<anti-retaliation protections and what constitutes retaliation>",
    "earlyTermination": "<tenant's rights to break lease early — domestic violence, military, job loss, etc.>"
  },
  "redFlags": [
    {
      "clause": "<clause name or location in lease>",
      "issue": "<one-line description of the problem>",
      "severity": "<high | medium | low>",
      "explanation": "<2-3 sentences explaining why this is a problem, what it could cost the tenant, and whether it may be unenforceable>"
    }
  ],
  "negotiationOpportunities": [
    {
      "clause": "<clause name>",
      "currentLanguage": "<what the lease currently says>",
      "suggested": "<specific replacement language to propose>",
      "rationale": "<why landlords often agree to this change and how to ask for it>"
    }
  ],
  "questionsToAsk": [
    "<specific question the tenant should ask the landlord or property manager before signing>"
  ],
  "fairnessScore": {
    "score": <integer 0-100; 100 = maximally tenant-favorable, 0 = maximally landlord-favorable>,
    "rating": "<Excellent | Good | Fair | Concerning | Dangerous>",
    "explanation": "<2-3 sentences explaining the score>",
    "keyReasons": ["<specific reason>", "<another reason>"]
  },
  "overallVerdict": "<2-3 sentences: should the tenant sign as-is, negotiate specific terms, or walk away — be direct and specific about what to do>"
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
    const typeNote  = `\n\nLEASE TYPE: ${leaseTypeLabel}. ${leaseType === 'commercial' ? 'Apply commercial lease standards. Commercial tenants have fewer statutory protections than residential tenants — flag this throughout and note where statutory protections do not apply.' : 'Apply full residential tenant protections.'}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: `${SYSTEM_PROMPT}${stateNote}${typeNote}`, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Analyze this ${leaseTypeLabel.toLowerCase()} lease agreement and return your complete analysis as JSON.\n\nLease:\n---\n${lease}\n---`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        summary: {},
        clauses: [],
        tenantRights: {},
        redFlags: [],
        negotiationOpportunities: [],
        questionsToAsk: [],
        fairnessScore: { score: 0, rating: 'Unknown', explanation: 'Analysis failed — please try again.', keyReasons: [] },
        overallVerdict: 'Analysis could not be completed. Please try again or consult a local tenant rights attorney.',
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
