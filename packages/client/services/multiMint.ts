import { Account } from '@/types';

async function multiMint(
  account: Account,
  projectAddresses: string[],
  recipients: string[],
): Promise<void> {
  if (account.connectContract === undefined) {
    throw new Error('Undefined account');
  }

  await account.connectContract.multiMint(projectAddresses, recipients);
}

export default multiMint;
