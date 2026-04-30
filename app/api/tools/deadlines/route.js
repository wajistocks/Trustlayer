import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a federal and state court procedural expert with 25 years of experience. Calculate all relevant legal deadlines for the given case type and jurisdiction.

Return ONLY valid JSON:
{
  "jurisdiction": "<Federal | State: [Name]>",
  "caseType": "<normalized case type>",
  "triggeringEvent": "<description of what the triggering date represents>",
  "deadlines": [
    {
      "name": "<deadline name, e.g. Answer to Complaint>",
      "daysFromTrigger": <integer, can be negative for pre-event deadlines>,
      "date": "<YYYY-MM-DD calculated from triggering date>",
      "rule": "<specific rule citation, e.g. FRCP Rule 12(a)(1)(A)>",
      "description": "<1-2 sentence plain English explanation of what must be done>",
      "criticality": "<critical | warning | safe>",
      "notes": "<any exceptions, extensions, or local rule variations>"
    }
  ],
  "importantNotes": ["<practitioner note>"],
  "disclaimer": "These deadlines are estimates based on standard rules. Local rules, standing orders, and specific case facts may alter deadlines. Always verify with the court clerk and consult an attorney."
}

Rules:
- For criticality: critical = 7 days or less from triggering date, warning = 8-30 days, safe = 31+ days
- Calculate actual calendar dates by adding daysFromTrigger to the triggeringDate (YYYY-MM-DD)
- Include 5-12 relevant deadlines depending on case complexity
- For Federal Civil: include FRCP Rules 12, 16, 26, 33, 34, 56 deadlines
- For Criminal: include arraignment, preliminary hearing, speedy trial act deadlines
- For Family/Probate: include state-specific deadlines
- For Bankruptcy: include 341 meeting, proof of claim, discharge objection deadlines
- For Appeal: include notice of appeal, brief, reply brief deadlines
- Always include the most critical deadlines first
- Be precise with rule citations (FRCP Rule 12(a)(1)(A)(i), not just "Rule 12")`

export async function POST(request) {
  try {
    const { state, caseType, triggeringDate, caseNumber } = await request.json()

    if (!state || typeof state !== 'string' || !state.trim()) {
      return Response.json({ error: 'Invalid input: state field is required' }, { status: 400 })
    }
    if (!caseType || typeof caseType !== 'string' || !caseType.trim()) {
      return Response.json({ error: 'Invalid input: caseType field is required' }, { status: 400 })
    }
    if (!triggeringDate || typeof triggeringDate !== 'string' || !triggeringDate.trim()) {
      return Response.json({ error: 'Invalid input: triggeringDate field is required' }, { status: 400 })
    }
    // Basic date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(triggeringDate.trim())) {
      return Response.json({ error: 'Invalid input: triggeringDate must be in YYYY-MM-DD format' }, { status: 400 })
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
          content: `Calculate all legal deadlines for: State: ${state}, Case type: ${caseType}, Triggering event date: ${triggeringDate}${caseNumber ? `, Case number: ${caseNumber}` : ''}`,
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
