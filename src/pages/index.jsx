import React from 'react';
import dynamic from 'next/dynamic';

// SSR को false करके क्लाइंट-साइड पर लोड करें
const TransferModule = dynamic(() => import('../components/TransferModule'), { ssr: false });
const ArcStreamEngine = dynamic(() => import('../components/ArcStreamEngine'), { ssr: false });

// बाकी के आपके सामान्य इंपोर्ट्स यहां रखें...
