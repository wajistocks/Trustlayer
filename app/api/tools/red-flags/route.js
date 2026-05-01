import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior contract attorney and partner at a top commercial litigation firm with 25 years of experience reviewing and litigating contracts. You have reviewed thousands of commercial contracts — NDAs, employment agreements, SaaS agreements, vendor contracts, commercial leases, and everything in between. You identify predatory clauses immediately, know exactly what is market-standard versus exploitative, and provide specific negotiation language that actually gets accepted. You have saved your clients millions of dollars in disputes by catching dangerous terms before they signed.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Analyze the submitted contract and return this exact JSON structure:

{
  "contractType": "<e.g. NDA, Employment Agreement, SaaS Agreement, Commercial Lease, Service Agreement>",
  "overallSafetyScore": <integer 0-100; start at 100, deduct: critical flag = 20pts, warning flag = 8pts, minimum 0>,
  "summary": "<2-3 sentence executive summary of the contract's overall risk profile and the most important issues to address>",
  "redFlags": [
    {
      "severity": "<critical | warning | ok>",
      "clauseName": "<short descriptive name of the problematic clause>",
      "originalText": "<direct quote of the problematic language from the contract, max 200 chars>",
      "issue": "<plain English explanation of why this clause is dangerous and what it could cost the signing party>",
      "recommendation": "<specific action: strike this clause, modify it, or add a carve-out — be direct>",
      "suggestedLanguage": "<specific replacement language the party should propose in negotiation>"
    }
  ],
  "positiveTerms": [
    "<a clause or term that is fair, standard, or favorable to the signing party>"
  ],
  "negotiationPriority": [
    "<the single most important thing to negotiate first>",
    "<second most important>",
    "<third most important>"
  ],
  "overallVerdict": "<1-2 sentences: should this party sign as-is, negotiate specific terms, or walk away — and why>"
}

Identify ALL dangerous clauses. For severity: critical = could expose the party to unlimited liability, loss of IP, or severe financial harm; warning = one-sided but manageable with negotiation; ok = slightly unfavorable but common/acceptable. Return only clauses that exist in the contract — do not invent flags for clauses that are not present. Include 3-8 red flags for a typical commercial contract.`

export async function POST(request) {
  try {
    const { contract } = await request.json()

    if (!contract || typeof contract !== 'string') {
      return Response.json({ error: 'Invalid input: contract field is required' }, { status: 400 })
    }
    if (contract.trim().length < 50) {
      return Response.json({ error: 'Contract too short — minimum 50 characters required' }, { status: 400 })
    }
    if (contract.length > 100000) {
      return Response.json({ error: 'Contract too long — maximum 100,000 characters allowed' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Scan this contract for red flags and return your analysis as JSON:\n\n---\n${contract}\n---`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        contractType: 'Unknown',
        overallSafetyScore: 0,
        summary: 'Analysis could not be completed — please try again.',
        redFlags: [],
        positiveTerms: [],
        negotiationPriority: [],
        overallVerdict: 'Analysis failed. Treat this contract with caution and seek legal review.',
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
