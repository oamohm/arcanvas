export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    app: 'arcanvas',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    env: {
      arcChainId:       process.env.NEXT_PUBLIC_ARC_CHAIN_ID   || 'not set',
      arcRpc:           process.env.NEXT_PUBLIC_ARC_RPC         || 'not set',
      arcscan:          process.env.NEXT_PUBLIC_ARCSCAN         || 'not set',
      usdcAddress:      process.env.NEXT_PUBLIC_USDC_ADDRESS    ? 'set' : 'not set',
      aiConfigured:     !!process.env.OPENROUTER_API_KEY,
      circleConfigured: !!process.env.CIRCLE_API_KEY,
    },
  });
}
