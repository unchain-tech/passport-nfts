import { Account } from '@/types';

async function changeStatusToAvailable(
  account: Account,
  projectAddress: string,
  user: string,
): Promise<void> {
  if (account.address === undefined || account.connectContract === undefined) {
    throw new Error('Undefined account');
  }

  await account.connectContract.changeStatusToAvailable(projectAddress, user);
}

export default changeStatusToAvailable;
