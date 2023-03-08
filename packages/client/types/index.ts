import { ProjectsController } from '@/types/typechain-types';

export type Account = {
  address: string | undefined;
  connectContract: ProjectsController | undefined;
};
