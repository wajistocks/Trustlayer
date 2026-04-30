import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a compassionate legal navigator helping someone represent themselves in court. This person is likely scared and overwhelmed. Use empathetic, clear language. Return ONLY valid JSON:
{
  "overview": "<2-3 sentence compassionate overview of their situation and what they can do about it>",
  "canHandleProSe": <true|false>,
  "difficulty": "<manageable | challenging | very_challenging>",
  "steps": [
    { "number": <1,2,3...>, "title": "<action step title>", "detail": "<specific instructions in plain English>", "documents": ["<document name needed for this step>"], "timeframe": "<when to do this>" }
  ],
  "requiredDocuments": [
    { "name": "<document name>", "purpose": "<why you need it>", "whereToGet": "<exactly where/how to obtain this>", "cost": "<free | $X | varies>" }
  ],
  "hearingPrep": ["<specific tip for the hearing>"],
  "yourRights": ["<specific legal right they have in this court/situation>"],
  "commonMistakes": ["<specific mistake to avoid>"],
  "courtResources": ["<court self-help center, clerk's office, legal aid, or online resource>"],
  "whenToHireAttorney": "<honest assessment of when professional legal help is worth the cost for this type of matter>",
  "encouragement": "<1-2 sentence empathetic closing that acknowledges how hard this is and affirms their ability to navigate it>"
}
Steps should be numbered 1-N (typically 5-10 steps). Be specific about which court forms to use (by name), where to file, fees, and what to expect. If the court type is Federal, reference the pro se handbook. If state court, reference the state's self-help resources.`

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
      return Response.json({ error: 'Situation too long: maximum 10,000 characters allowed' }, { status: 400 })
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
          content: `Pro se legal assistance needed:\nSituation: ${situation}\nCourt type: ${courtType}\nState: ${state}`,
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
