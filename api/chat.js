export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) {
    res.status(500).send('Server is missing CEREBRAS_API_KEY')
    return
  }

  const { messages } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).send('messages[] is required')
    return
  }

  const upstream = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-oss-120b',
      messages,
      max_tokens: 2048,
      temperature: 0.5,
      stream: true,
    }),
  })

  if (!upstream.ok) {
    const body = await upstream.text()
    res.status(upstream.status).send(body)
    return
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }
  } finally {
    res.end()
  }
}
