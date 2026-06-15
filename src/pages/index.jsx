import Head from 'next/head';
import TransferModule from '../components/TransferModule';
export default function Home() {
  return (
    <>
      <Head>
        <title>arcanvas</title>
        <meta name="description" content="Transfer ARC and USDC on Arc Testnet. Verify on testnet.arcscan.app."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="theme-color" content="#080c14"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <TransferModule/>
    </>
  );
}
