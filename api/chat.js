/*
 * Vercel Edge Function — proxies the chatbot to Cerebras.
 * The API key lives ONLY here (server-side env var CEREBRAS_API_KEY), so it
 * is never shipped to the browser. The client posts { messages } and gets the
 * streamed SSE response piped straight back.
 */
export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) {
    return new Response('Server is missing CEREBRAS_API_KEY', { status: 500 })
  }

  let messages
  try {
    const body = await req.json()
    messages = body.messages
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('messages[] is required', { status: 400 })
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

  // pass status + the SSE stream straight through to the browser
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
