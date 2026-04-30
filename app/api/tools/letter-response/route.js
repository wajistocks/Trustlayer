import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a legal defense specialist helping an individual respond to a legal letter. Return ONLY valid JSON:
{
  "urgency": "<high | medium | low>",
  "senderAnalysis": "<2-3 sentences analyzing who sent this and their legal standing>",
  "claims": ["<each specific claim or demand the sender is making>"],
  "legalAccuracy": "<assessment of whether their claims are legally accurate, with specific notes on any overreach or errors>",
  "yourRights": ["<specific legal right the recipient has in this situation>"],
  "protectiveLaws": [
    { "name": "<law name>", "citation": "<exact citation>", "howItHelps": "<specific protection this law provides>" }
  ],
  "responseLetter": "<Complete professionally drafted response letter, ready to send. Use formal letter format with [DATE], [YOUR NAME], [YOUR ADDRESS] placeholders. The letter should be firm, legally accurate, and professional. Reference specific laws that protect the recipient.>",
  "deadlines": ["<any time-sensitive actions the recipient must take>"],
  "warnings": ["<anything the recipient should NOT do>"],
  "disclaimer": "This response letter is for informational purposes only. For legal matters involving significant money, employment, housing, or your liberty, please have a licensed attorney review before sending."
}

Sender-type guidance:
- Debt Collector: Apply FDCPA protections (15 U.S.C. § 1692), 30-day dispute rights, cease-and-desist options
- Landlord: Apply state-specific tenant protections, security deposit rules, habitability rights
- Employer: Apply NLRA, FLSA, ADA, Title VII, state labor laws as relevant
- Opposing Counsel: More formal tone, focus on procedural rights and preservation of claims
- Government Agency: Identify which agency, apply relevant administrative law and due process rights
- Business Partner: Focus on contract terms, good faith obligations, UCC Article 1-203`

export async function POST(request) {
  try {
    const { letter, senderType, state } = await request.json()

    if (!letter || typeof letter !== 'string' || !letter.trim()) {
      return Response.json({ error: 'Invalid input: letter field is required' }, { status: 400 })
    }
    if (!senderType || typeof senderType !== 'string' || !senderType.trim()) {
      return Response.json({ error: 'Invalid input: senderType field is required' }, { status: 400 })
    }
    if (!state || typeof state !== 'string' || !state.trim()) {
      return Response.json({ error: 'Invalid input: state field is required' }, { status: 400 })
    }
    if (letter.length > 50000) {
      return Response.json({ error: 'Letter too long: maximum 50,000 characters allowed' }, { status: 400 })
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
          content: `Analyze this legal letter and generate a response.\nSender type: ${senderType}\nRecipient's state: ${state}\n\nLetter:\n---\n${letter}\n---`,
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
