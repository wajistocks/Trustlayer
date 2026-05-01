import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior litigation attorney and court procedures expert with 25 years of experience across federal and state courts. You have never missed a deadline in your career, and you have saved clients from malpractice exposure by catching deadline traps that other attorneys missed. You know every federal rule, every state procedural rule, every local court rule, every tolling provision, and every trap that catches less experienced attorneys. Your deadline analyses are relied upon by partners to protect the firm from malpractice.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Calculate all relevant legal deadlines and return this exact JSON:

{
  "jurisdiction": "<Federal | State: [State Name]>",
  "caseType": "<normalized case type>",
  "triggeringEvent": "<plain English description of what the triggering date represents and why it starts the clock>",
  "deadlines": [
    {
      "name": "<deadline name, e.g. Answer to Complaint, Notice of Appeal>",
      "daysFromTrigger": <integer — positive for future, negative for pre-event deadlines>,
      "date": "<YYYY-MM-DD calculated from triggering date>",
      "rule": "<specific rule citation, e.g. FRCP Rule 12(a)(1)(A)(i), Cal. C.C.P. § 430.40>",
      "description": "<1-2 sentence plain English explanation of what must be filed or done by this date>",
      "criticality": "<critical | warning | safe>",
      "notes": "<any exceptions, extensions, local rule variations, or traps to watch for>"
    }
  ],
  "importantNotes": [
    "<practitioner note — local rules, standing orders, e-filing requirements, or jurisdiction-specific traps>"
  ],
  "disclaimer": "These deadlines are estimates based on standard rules. Local rules, standing orders, judge-specific requirements, and case-specific facts may alter deadlines. Always verify with the court clerk and consult an attorney before relying on any deadline."
}

Rules:
- criticality: critical = deadline within 7 days of trigger, warning = 8-30 days, safe = 31+ days
- Calculate actual calendar dates by adding daysFromTrigger to the triggeringDate
- Include 5-12 relevant deadlines depending on case complexity — always most critical first
- Federal Civil: FRCP Rules 12, 16, 26, 33, 34, 56 where applicable
- Criminal: arraignment, preliminary hearing, speedy trial, pretrial motions
- Family/Probate: state-specific deadlines
- Bankruptcy: 341 meeting, proof of claim, discharge objection
- Appeals: notice of appeal, record designation, opening brief, response, reply
- Always cite the most specific rule possible (subsection level)`

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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(triggeringDate.trim())) {
      return Response.json({ error: 'Invalid input: triggeringDate must be in YYYY-MM-DD format' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Calculate all legal deadlines for this matter and return as JSON.\n\nJurisdiction/State: ${state}\nCase type: ${caseType}\nTriggering event date: ${triggeringDate}${caseNumber ? `\nCase number: ${caseNumber}` : ''}`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        jurisdiction: state,
        caseType,
        triggeringEvent: 'Analysis failed — please try again',
        deadlines: [],
        importantNotes: ['Deadline calculation failed. Do not rely on this result. Consult an attorney immediately.'],
        disclaimer: 'Analysis failed. Consult a licensed attorney for all deadline calculations.',
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
