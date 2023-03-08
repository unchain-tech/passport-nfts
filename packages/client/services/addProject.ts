import { Account } from '@/types';

async function addProject(
  account: Account,
  projectAddress: string,
): Promise<void> {
  if (account.connectContract === undefined) {
    throw new Error('Undefined account');
  }

  await account.connectContract.addProjectContractAddress(projectAddress);
}

export default addProject;
