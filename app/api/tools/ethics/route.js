import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a legal ethics expert and bar counsel with expertise in all 50 state bar rules and ABA Model Rules. Return ONLY valid JSON:
{
  "summary": "<2-3 sentence overview of the ethical issue presented>",
  "riskLevel": "<high | medium | low>",
  "abaRules": [
    { "rule": "<e.g. 1.7>", "title": "<rule title>", "relevance": "<why this rule applies>", "keyLanguage": "<most relevant quote or paraphrase>" }
  ],
  "stateRules": [
    { "rule": "<state rule citation>", "state": "<state>", "difference": "<how this state rule differs from ABA Model Rules, or 'Identical to ABA Model Rule X'>", "relevance": "<why relevant>" }
  ],
  "ethicsOpinions": [
    { "citation": "<e.g. ABA Formal Op. 512 (2023)>", "issuer": "<ABA | [State] Bar>", "summary": "<what the opinion says about AI or this topic>" }
  ],
  "answer": "<Clear, direct answer to the ethical question posed. Be specific and practical.>",
  "relatedIssues": ["<other ethical issues the attorney should consider>"],
  "nextSteps": ["<specific recommended actions>"],
  "hotlineInfo": "For complex ethics matters, contact your state bar's ethics hotline. Most state bars offer free confidential guidance for attorneys. Find your bar's hotline at americanbar.org/groups/professional_responsibility/resources/links_of_interest."
}`

export async function POST(request) {
  try {
    const { situation, state, practiceArea } = await request.json()

    if (!situation || typeof situation !== 'string' || !situation.trim()) {
      return Response.json({ error: 'Invalid input: situation field is required' }, { status: 400 })
    }
    if (!state || typeof state !== 'string' || !state.trim()) {
      return Response.json({ error: 'Invalid input: state field is required' }, { status: 400 })
    }
    if (!practiceArea || typeof practiceArea !== 'string' || !practiceArea.trim()) {
      return Response.json({ error: 'Invalid input: practiceArea field is required' }, { status: 400 })
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
          content: `Ethics question: ${situation}\nState bar: ${state}\nPractice area: ${practiceArea}`,
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
