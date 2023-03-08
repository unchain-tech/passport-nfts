import { Account } from '@/types';

async function getAllProjectInfo(account: Account): Promise<
  [string[], string[], string[]] & {
    projectAddresses: string[];
    projectNames: string[];
    passportHashes: string[];
  }
> {
  if (account.connectContract === undefined) {
    throw new Error('Undefined account');
  }

  const allProjectInfo = await account.connectContract.getAllProjectInfo();

  return allProjectInfo;
}

export default getAllProjectInfo;
