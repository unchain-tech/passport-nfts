import { Account } from '@/types';

async function mint(account: Account, projectAddress: string): Promise<void> {
  if (account.connectContract === undefined) {
    throw new Error('Undefined account');
  }

  await account.connectContract.mint(projectAddress);
}

export default mint;
