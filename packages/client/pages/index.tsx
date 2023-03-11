import Head from 'next/head';

import HomeTemp from '@/components/templates/homeTemp';

export default function Home() {
  return (
    <>
      <Head>
        <title>NFT Distribution</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeTemp
        subtitle="Welcome to UNCHAIN passport dApp!!"
        imgUrl="/passport_3.jpeg"
        buttonName="Connect Wallet"
      />
    </>
  );
}
