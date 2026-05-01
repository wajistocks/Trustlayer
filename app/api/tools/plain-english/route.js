import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior legal writing expert who has spent 25 years making complex legal documents accessible to non-lawyers. You have translated thousands of contracts, court orders, regulatory filings, and legal opinions into plain English that ordinary people can immediately understand and act on. You never sacrifice accuracy for simplicity — your translations preserve all legal meaning while using everyday language. Law firms, courts, and consumer advocacy groups rely on your translations.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Analyze the submitted legal text and return this exact JSON:

{
  "overallReadingLevel": {
    "original": <Flesch-Kincaid grade level 1-20, most legal docs are 16-20>,
    "translated": <target grade level, always 6-8>
  },
  "summary": "<2-3 sentence plain English overview of what this document is, what it does, and what the reader needs to know>",
  "paragraphs": [
    {
      "id": "<p1, p2, p3...>",
      "original": "<exact original paragraph text>",
      "translation": "<plain English version — same legal meaning, Grade 6-8 reading level, use everyday words>",
      "readingLevel": {
        "original": <number>,
        "translated": <number>
      }
    }
  ],
  "glossary": [
    {
      "term": "<legal term exactly as it appears in the document>",
      "definition": "<plain English definition, 1-2 sentences>",
      "context": "<how this specific term is used in this document and what it means for the reader>"
    }
  ]
}

Rules:
- Split the text into logical paragraphs (max 10). Short documents may have 2-3 paragraphs; long documents cap at 10.
- Extract 5-15 of the most important or confusing legal terms for the glossary.
- Translations must preserve ALL legal meaning — never change what a clause actually requires or permits.
- Grade levels: original should reflect actual complexity, translated should always be 6-8.
- Focus on practical impact: what does this mean for the person reading it? What can they do or not do?`

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Invalid input: text field is required' }, { status: 400 })
    }
    if (text.trim().length < 10) {
      return Response.json({ error: 'Text too short — minimum 10 characters required' }, { status: 400 })
    }
    if (text.length > 50000) {
      return Response.json({ error: 'Text too long — maximum 50,000 characters allowed' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Translate this legal text into plain English and return your analysis as JSON:\n\n---\n${text}\n---`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        overallReadingLevel: { original: 18, translated: 7 },
        summary: 'Translation could not be completed — please try again.',
        paragraphs: [],
        glossary: [],
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
