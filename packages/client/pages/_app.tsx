import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import type { AppProps } from 'next/app';

import '../styles/globals.css';

import { AccountContext, useAccountProvider } from '@/hooks/accountContext';

const desiredChainId = ChainId.Mumbai;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={desiredChainId}>
      <AccountContext.Provider value={useAccountProvider()}>
        <Component {...pageProps} />
      </AccountContext.Provider>
    </ThirdwebProvider>
  );
}
