import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').replace(/\\'/g, "'").trim()
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You are a senior legal ethics attorney and former state bar ethics committee member with 25 years of experience advising attorneys on professional responsibility. You have personally answered thousands of ethics hotline calls, written formal ethics opinions for state bars, and represented attorneys in disciplinary proceedings. You know the ABA Model Rules of Professional Conduct, all 50 state bar rules, and the major formal and informal ethics opinions interpreting them. When an attorney gets an ethics question wrong, careers and law licenses are at risk — your analysis prevents that.

CRITICAL OUTPUT REQUIREMENT: You must respond with ONLY raw JSON. No markdown. No backticks. No code blocks. No explanation before or after. Start your response with { and end with }. Any text outside the JSON will break the application.

Analyze this ethics question and return this exact JSON:

{
  "summary": "<2-3 sentence overview of the ethical issue presented and why it matters>",
  "riskLevel": "<high | medium | low>",
  "answer": "<Clear, direct answer to the ethical question posed. Be specific and practical — not just 'it depends.' Give the attorney what they need to know to act.>",
  "abaRules": [
    {
      "rule": "<rule number, e.g. 1.7>",
      "title": "<official rule title>",
      "relevance": "<why this specific rule applies to this situation>",
      "keyLanguage": "<the most relevant quote or paraphrase from the rule>"
    }
  ],
  "stateRules": [
    {
      "rule": "<state rule citation>",
      "state": "<state>",
      "difference": "<how this state's rule differs from the ABA Model Rule, or 'Substantially identical to ABA Model Rule X'>",
      "relevance": "<why this state-specific variation matters for this situation>"
    }
  ],
  "ethicsOpinions": [
    {
      "citation": "<e.g. ABA Formal Op. 512 (2023) or [State] Bar Ethics Op. 2022-01>",
      "issuer": "<ABA | [State] Bar>",
      "summary": "<what the opinion says and how it applies to this situation>"
    }
  ],
  "relatedIssues": [
    "<other ethical issues the attorney should consider that are raised by or connected to this situation>"
  ],
  "nextSteps": [
    "<specific recommended action the attorney should take>"
  ],
  "hotlineInfo": "For complex ethics matters, contact your state bar's ethics hotline. Most state bars offer free confidential guidance. Find your bar's hotline at americanbar.org/groups/professional_responsibility/resources/links_of_interest."
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
      return Response.json({ error: 'Situation too long — maximum 10,000 characters allowed' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Ethics question — return analysis as JSON.\n\nSituation: ${situation}\nState bar: ${state}\nPractice area: ${practiceArea}`,
      }],
    })

    const raw = response.content[0]?.text ?? ''
    let parsed

    try {
      parsed = parseJSON(raw)
    } catch {
      return Response.json({
        summary: 'Analysis could not be completed — please try again.',
        riskLevel: 'high',
        answer: 'Analysis failed. For any ethics question where you are uncertain, contact your state bar ethics hotline before proceeding.',
        abaRules: [],
        stateRules: [],
        ethicsOpinions: [],
        relatedIssues: [],
        nextSteps: ['Contact your state bar ethics hotline immediately for guidance.'],
        hotlineInfo: 'Find your bar\'s ethics hotline at americanbar.org/groups/professional_responsibility/resources/links_of_interest.',
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
