import { Account } from '@/types';

async function grantControllerRole(
  account: Account,
  to: string,
): Promise<void> {
  if (account.connectContract === undefined) {
    throw new Error('Undefined account');
  }

  await account.connectContract.grantControllerRole(to);
}

export default grantControllerRole;
