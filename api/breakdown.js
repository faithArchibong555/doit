// api/breakdown.js
// Vercel serverless function — keeps Anthropic API key safe on server
// Receives: { task: string, mood: string }
// Returns: { subtasks: string[] }
export default async function handler(req, res) {
  console.log("BREAKDOWN FUNCTION RUNNING")
  console.log("API Key exists:", !!process.env.ANTHROPIC_API_KEY)
  console.log("ENV KEYS:")
console.log(
  Object.keys(process.env)
    .filter(key => key.includes("ANTHROPIC"))
)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { task, mood = 'focused' } = req.body

  if (!task || typeof task !== 'string' || task.trim().length === 0) {
    return res.status(400).json({ error: 'Task text is required' })
  }

  const moodContext = {
    tired:    'The user is feeling tired today. Keep steps very small, simple and encouraging.',
    focused:  'The user is feeling focused. Give clear, actionable steps.',
    energised: 'The user is feeling energised and motivated. Steps can be more ambitious.'
  }[mood] || 'Give clear, actionable steps.'

  const prompt = `You are an AI execution assistant inside a productivity app called Doit.

A user has added this task: "${task.trim()}"

${moodContext}

Break this task into 4–6 clear, specific, actionable sub-steps. 
Each step should be something the user can actually start doing immediately.
Steps should be in the right order to complete the task.

IMPORTANT: Return ONLY a valid JSON array of strings. No explanation, no markdown, no preamble.
Example format: ["Step one", "Step two", "Step three"]`

  console.log("API Key exists:", !!process.env.ANTHROPIC_API_KEY)
console.log(
  "API Key starts with:",
  process.env.ANTHROPIC_API_KEY?.slice(0, 20)
)
console.log(
  "API Key length:",
  process.env.ANTHROPIC_API_KEY?.length
)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Anthropic error:', err)
      return res.status(502).json({ error: 'AI service error', details: err })
    }

    const data = await response.json()
    const raw = data.content?.[0]?.text || '[]'

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let subtasks
    try {
      // Most robust: extract the first JSON array substring.
      // Model output sometimes includes extra text or formatting.
      const firstBracket = cleaned.indexOf('[')
      const lastBracket = cleaned.lastIndexOf(']')

      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const arrayText = cleaned.slice(firstBracket, lastBracket + 1)
        subtasks = JSON.parse(arrayText)
      } else {
        // Fallback: try parsing the entire cleaned string.
        subtasks = JSON.parse(cleaned)
      }
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON array', { parseErr: parseErr.message, cleaned })
      return res.status(500).json({
        error: 'AI response was not valid JSON array',
        details: {
          message: parseErr.message,
          raw,
          cleaned,
        },
      })
    }

    if (!Array.isArray(subtasks)) {
      return res.status(500).json({
        error: 'AI response was not an array',
        details: { raw, cleaned },
      })
    }

    return res.status(200).json({ subtasks })
  } catch (err) {
    console.error('Breakdown error:', err)
    return res.status(500).json({ error: 'Failed to generate breakdown', message: err.message })
  }
}