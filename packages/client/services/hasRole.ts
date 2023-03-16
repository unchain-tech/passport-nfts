import { Account, RoleStatus } from '@/types';

async function hasRole(account: Account, role: RoleStatus): Promise<boolean> {
  if (account.address === undefined || account.connectContract === undefined) {
    throw new Error('Undefined account');
  }

  let checkRole: string;
  switch (role) {
    case 'ADMIN':
      checkRole = await account.connectContract.ADMIN_ROLE();
      break;
    case 'CONTROLLER':
      checkRole = await account.connectContract.CONTROLLER_ROLE();
      break;
    default:
      return false;
  }

  const hasRole = await account.connectContract.hasRole(
    checkRole,
    account.address,
  );

  return hasRole;
}

export default hasRole;
