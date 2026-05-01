import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior public interest attorney with 25 years of experience helping self-represented individuals navigate the legal system. You have personally guided thousands of people through small claims court, eviction proceedings, family court, debt disputes, and civil rights cases without an attorney. You are compassionate and deeply understand that the people asking for your help are scared, overwhelmed, and often in crisis. You give practical, step-by-step guidance that actually helps — not vague advice, but specific forms, specific offices, specific fees, and specific words to say. You treat every person as capable of navigating their situation with the right guidance.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Return this exact JSON:

{
  "overview": "<2-3 sentence compassionate overview that acknowledges how hard this is, explains what they are facing, and affirms that this is manageable with the right steps>",
  "canHandleProSe": <true | false>,
  "difficulty": "<manageable | challenging | very_challenging>",
  "steps": [
    {
      "number": <1, 2, 3...>,
      "title": "<action step title>",
      "detail": "<specific instructions in plain English — which form, which office, what to say, what to bring>",
      "documents": ["<specific document or form needed for this step, by name>"],
      "timeframe": "<when to do this — before your hearing, within X days, immediately, etc.>"
    }
  ],
  "requiredDocuments": [
    {
      "name": "<exact document or form name>",
      "purpose": "<why you need this specific document>",
      "whereToGet": "<exactly where and how to obtain this — court clerk's office, state website URL, etc.>",
      "cost": "<free | $X | varies>"
    }
  ],
  "hearingPrep": [
    "<specific, practical tip for the hearing — what to wear, what to bring, how to address the judge, what to say and not say>"
  ],
  "yourRights": [
    "<specific legal right they have in this court or situation, explained in plain English>"
  ],
  "commonMistakes": [
    "<specific mistake that self-represented people commonly make in this type of case that you must avoid>"
  ],
  "courtResources": [
    "<specific resource — court self-help center, legal aid organization, state bar referral service, or official self-help website>"
  ],
  "whenToHireAttorney": "<honest, specific assessment of when professional legal help is worth the cost for this type of matter — what are the signals that it has gotten too complex to handle alone>",
  "encouragement": "<1-2 sentence warm, genuine closing that acknowledges the difficulty of what they are facing and affirms their ability to get through this>"
}

Be specific about which court forms to use (by name and number), where to file them, what fees to expect, and exactly what happens at each stage. If federal court, reference the pro se handbook. If state court, reference the state's self-help resources by name.`

export async function POST(request) {
  try {
    const { situation, courtType, state } = await request.json()

    if (!situation || typeof situation !== 'string' || !situation.trim()) {
      return Response.json({ error: 'Invalid input: situation field is required' }, { status: 400 })
    }
    if (!courtType || typeof courtType !== 'string' || !courtType.trim()) {
      return Response.json({ error: 'Invalid input: courtType field is required' }, { status: 400 })
    }
    if (!state || typeof state !== 'string' || !state.trim()) {
      return Response.json({ error: 'Invalid input: state field is required' }, { status: 400 })
    }
    if (situation.length > 10000) {
      return Response.json({ error: 'Situation too long — maximum 10,000 characters allowed' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Pro se legal assistance needed — return guidance as JSON.\n\nSituation: ${situation}\nCourt type: ${courtType}\nState: ${state}`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        overview: 'We were unable to complete your analysis. Please try again.',
        canHandleProSe: true,
        difficulty: 'challenging',
        steps: [],
        requiredDocuments: [],
        hearingPrep: [],
        yourRights: [],
        commonMistakes: [],
        courtResources: ['Contact your local court self-help center for assistance.', 'Legal aid organizations offer free help: lawhelp.org'],
        whenToHireAttorney: 'Given that the analysis failed, consider contacting a legal aid organization or bar referral service to connect with an attorney.',
        encouragement: 'You can get through this. Start by contacting your local court self-help center — they are there specifically to help people in your situation.',
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
