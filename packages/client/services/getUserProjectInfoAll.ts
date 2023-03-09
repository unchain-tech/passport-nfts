import { Account } from '@/types';

async function getUserProjectInfoAll(account: Account): Promise<
  [string[], string[], number[]] & {
    projectAddresses: string[];
    passportHashes: string[];
    mintStatuses: number[];
  }
> {
  if (account.connectContract === undefined || account.address === undefined) {
    throw new Error('Undefined account');
  }

  const userInfo = await account.connectContract.getUserProjectInfoAll(
    account.address,
  );

  return userInfo;
}

export default getUserProjectInfoAll;
