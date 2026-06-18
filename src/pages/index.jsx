import dynamic from 'next/dynamic';

const TransferModule = dynamic(() => import('../components/TransferModule'), { ssr: false });
const ArcStreamEngine = dynamic(() => import('../components/ArcStreamEngine'), { ssr: false });
const ConnectButton = dynamic(() => import('@rainbow-me/rainbowkit').then(m => m.ConnectButton), { ssr: false });
