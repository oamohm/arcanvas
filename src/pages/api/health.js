export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    app: 'arcanvas',
    version: '1.0.0',
    ts: new Date().toISOString(),
    env: {
      arcChainId: process.env.NEXT_PUBLIC_ARC_CHAIN_ID || 'not set',
      usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS ? 'set' : 'not set',
      aiConfigured: !!process.env.OPENROUTER_API_KEY,
      circleConfigured: !!process.env.CIRCLE_API_KEY,
    }
  });
}
