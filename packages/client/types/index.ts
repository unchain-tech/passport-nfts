import { ProjectsController } from '@/types/typechain-types';

export type RoleStatus = 'ADMIN' | 'CONTROLLER' | 'NONE' | 'CHECKING';

export type Account = {
  address: string | undefined;
  role: RoleStatus;
  connectContract: ProjectsController | undefined;
};
