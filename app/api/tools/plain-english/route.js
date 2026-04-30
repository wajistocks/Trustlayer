import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a legal plain-English translation specialist. Analyze the submitted legal text and return ONLY valid JSON:
{
  "overallReadingLevel": { "original": <Flesch-Kincaid grade 1-20>, "translated": <target grade, always 6-8> },
  "summary": "<2-sentence plain English overview of the entire document>",
  "paragraphs": [
    { "id": "<p1>", "original": "<exact paragraph text>", "translation": "<plain English version, same meaning, Grade 6-8>", "readingLevel": { "original": <number>, "translated": <number> } }
  ],
  "glossary": [
    { "term": "<legal term>", "definition": "<plain English definition, 1-2 sentences>", "context": "<how it is used in this specific document>" }
  ]
}
Rules: Split the text into logical paragraphs (max 10 paragraphs). Extract 5-15 important legal terms for the glossary. Translations must preserve all legal meaning while using simple words. Grade levels: original should reflect actual complexity (most legal docs are 16-20), translated should be 6-8.`

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Invalid input: text field is required and must be a string' }, { status: 400 })
    }
    if (text.trim().length < 10) {
      return Response.json({ error: 'Text too short: minimum 10 characters required' }, { status: 400 })
    }
    if (text.length > 50000) {
      return Response.json({ error: 'Text too long: maximum 50,000 characters allowed' }, { status: 400 })
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
          content: `Analyze this legal text:\n\n---\n${text}\n---`,
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
        inputTokens:      response.usage.input_tokens,
        outputTokens:     response.usage.output_tokens,
        cacheReadTokens:  response.usage.cache_read_input_tokens ?? 0,
      },
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: 'Invalid API key' }, { status: 401 })
    if (error instanceof Anthropic.RateLimitError)      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    if (error instanceof Anthropic.APIError)            return Response.json({ error: `API error: ${error.message}` }, { status: error.status ?? 500 })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
