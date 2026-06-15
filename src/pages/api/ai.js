/**
 * POST /api/ai
 * Body: { messages: [{role, content}] }
 * Requires OPENROUTER_API_KEY in Vercel env vars — never exposed to client.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI not configured. Add OPENROUTER_API_KEY in Vercel → Settings → Environment Variables.',
    });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://arcanvas.vercel.app',
        'X-Title': 'Arcanvas',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        max_tokens: 400,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You are the Arcanvas AI assistant. Help users understand Arc testnet transfers, USDC settlements, gas estimation, and transaction verification on testnet.arcscan.app. Be concise and technical.',
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
