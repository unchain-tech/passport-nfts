import { ethers } from 'ethers';
import { createContext, useContext, useEffect, useState } from 'react';

import ProjectsControllerArtifacts from '@/artifacts/contracts/ProjectsController.sol/ProjectsController.json';
import { Account } from '@/types';
import { ProjectsController } from '@/types/typechain-types';

type AccountState = {
  account: Account | undefined;
  connectWallet?: () => Promise<Account | undefined>;
};

const initialize: AccountState = {
  account: undefined,
  connectWallet: undefined,
};

export const AccountContext = createContext(initialize);
// カスタムプロバイダーと、データを参照するためのカスタムフックを両方同じモジュールで提供するため.
export const useAccountContext = (): AccountState => useContext(AccountContext);

export const useAccountProvider = () => {
  const [account, setAccount] = useState<Account | undefined>(
    initialize.account,
  );

  useEffect(() => {
    (async () => {
      const account = await generateAccount('eth_accounts');
      console.log(account?.address);
      setAccount(account);
    })();
  }, []);

  const connectWallet = async (): Promise<Account | undefined> => {
    const account = await generateAccount('eth_requestAccounts');
    console.log(account?.address);
    setAccount(account);

    return account;
  };

  const generateAccount = async (
    ethMethod: 'eth_accounts' | 'eth_requestAccounts',
  ): Promise<Account | undefined> => {
    if (window.ethereum === undefined) {
      console.log('Metamask not installed.');
      return undefined;
    }

    const accounts = await window.ethereum?.request({
      method: ethMethod,
    });
    if (accounts[0] === undefined) {
      console.log('Error fetching account.');
      return undefined;
    }

    // @ts-ignore: ethereum as ethers.providers.ExternalProvider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(accounts[0]);

    const connectContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      ProjectsControllerArtifacts.abi,
      signer,
    ) as ProjectsController;
    const address = await signer.getAddress();

    const account: Account = {
      address: address,
      connectContract: connectContract,
    };

    return account;
  };

  return { account, connectWallet };
};
