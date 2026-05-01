import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior attorney specializing in consumer rights, employment law, debt defense, landlord-tenant disputes, and business disputes with 25 years of experience. You have helped thousands of individuals assert their rights against threatening letters from debt collectors, employers, landlords, opposing counsel, and government agencies. You know exactly which federal and state laws protect recipients and how to assert those protections firmly and professionally. Your response letters have stopped harassment, prevented illegal collection, protected jobs, and saved homes.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Analyze this legal letter and return this exact JSON:

{
  "urgency": "<high | medium | low>",
  "senderAnalysis": "<2-3 sentences analyzing who sent this, their legal standing, and what they can actually do vs. what they are threatening>",
  "claims": ["<each specific claim or demand the sender is making>"],
  "legalAccuracy": "<assessment of whether their claims are legally accurate, with specific notes on any overreach, empty threats, or legal errors in their letter>",
  "yourRights": ["<specific legal right the recipient has in this situation, cited to a specific law>"],
  "protectiveLaws": [
    {
      "name": "<law name>",
      "citation": "<exact legal citation>",
      "howItHelps": "<specific protection this law provides the recipient in this exact situation>"
    }
  ],
  "responseLetter": "<Complete professionally drafted response letter, ready to send. Use formal letter format with [DATE], [YOUR NAME], [YOUR ADDRESS] placeholders. The letter should be firm, legally accurate, assertive without being hostile, and reference specific laws that protect the recipient. This letter should make the sender reconsider their position.>",
  "deadlines": ["<any time-sensitive actions the recipient must take, with specific dates or timeframes>"],
  "warnings": ["<specific thing the recipient must NOT do — e.g. do not make a payment, do not sign anything, do not communicate by phone>"],
  "disclaimer": "This response letter is for informational purposes only. For legal matters involving significant money, employment, housing, or your liberty, please have a licensed attorney review before sending."
}

Sender-type guidance:
- Debt Collector: Apply FDCPA (15 U.S.C. § 1692) — 30-day written dispute right, cease-and-desist options, validation of debt requirements, prohibition on false/misleading statements
- Landlord: Apply state-specific tenant protections, security deposit rules, habitability rights, anti-retaliation laws, proper notice requirements
- Employer: Apply NLRA, FLSA, ADA, Title VII, FMLA, state labor laws, whistleblower protections as relevant
- Opposing Counsel: Formal professional tone, focus on procedural rights, preservation of claims, statutes of limitations
- Government Agency: Identify agency, apply administrative law, due process rights, right to hearing, FOIA rights
- Business Partner: Contract terms, good faith obligations, UCC Article 1-203, specific performance options`

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
      return Response.json({ error: 'Letter too long — maximum 50,000 characters allowed' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Analyze this legal letter and generate a response.\nSender type: ${senderType}\nRecipient's state: ${state}\n\nLetter:\n---\n${letter}\n---`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        urgency: 'medium',
        senderAnalysis: 'Analysis could not be completed — please try again.',
        claims: [],
        legalAccuracy: 'Unable to assess.',
        yourRights: [],
        protectiveLaws: [],
        responseLetter: 'Analysis failed. Please try again or consult an attorney.',
        deadlines: [],
        warnings: ['Do not take any action based on this letter until you get a successful analysis or consult an attorney.'],
        disclaimer: 'Analysis failed. Consult a licensed attorney for matters involving significant money, housing, or employment.',
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
