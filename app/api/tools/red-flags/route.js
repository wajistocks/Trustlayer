import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a contract review specialist. Scan the submitted contract for dangerous clauses and return ONLY valid JSON:
{
  "safetyScore": <0-100 integer>,
  "verdict": "<Safe | Caution | Dangerous>",
  "summary": "<2-3 sentence executive summary of contract risk>",
  "flags": [
    {
      "type": "<exact type from list below>",
      "label": "<human-readable label>",
      "found": <true|false>,
      "severity": "<high | medium | low | none>",
      "excerptHint": "<first 100 chars of the problematic clause, or null if not found>",
      "plainEnglish": "<what this clause means in plain English, or null if not found>",
      "whatItMeansForYou": "<specific practical impact on the signing party, or null if not found>",
      "negotiationLanguage": "<suggested replacement or strike language, or null if not found>"
    }
  ]
}

Scan specifically for these 20 types (use exact type strings):
unlimited_liability | automatic_renewal | one_sided_indemnification | broad_ip_assignment | noncompete_overreach | mandatory_arbitration | unilateral_modification | liquidated_damages | personal_guarantee | unfavorable_jurisdiction | class_action_waiver | limitation_of_remedies | force_majeure_gaps | assignment_without_consent | termination_without_cause | nondisparagement_overreach | broad_confidentiality | fee_shifting | unfavorable_governing_law | warranty_disclaimer

Safety score rules: Start at 100. Deduct: high severity found = 15 pts, medium = 8 pts, low = 3 pts. Minimum 0.
Verdict: 80-100 = Safe, 50-79 = Caution, 0-49 = Dangerous.
For each found flag: excerptHint should be the most concerning language you found. negotiationLanguage should be a specific suggested clause or strike instruction.`

export async function POST(request) {
  try {
    const { contract } = await request.json()

    if (!contract || typeof contract !== 'string') {
      return Response.json({ error: 'Invalid input: contract field is required and must be a string' }, { status: 400 })
    }
    if (contract.trim().length < 50) {
      return Response.json({ error: 'Contract too short: minimum 50 characters required' }, { status: 400 })
    }
    if (contract.length > 100000) {
      return Response.json({ error: 'Contract too long: maximum 100,000 characters allowed' }, { status: 400 })
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
          content: `Scan this contract for red flags:\n\n---\n${contract}\n---`,
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
