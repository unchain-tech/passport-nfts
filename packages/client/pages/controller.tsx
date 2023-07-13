import React, { useEffect, useState } from 'react';

import ControllerTemp from '@/components/templates/controllerTemp';
import { useAccountContext } from '@/hooks/accountContext';
import getAllProjectInfo from '@/services/getAllProjectInfo';

export default function Controller() {
  const { account } = useAccountContext();
  const [projectAddresses, setProjectAddresses] = useState<string[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [passportHashes, setPassportHashes] = useState<string[]>([]);
  const [mintStatuses, setMintStatuses] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      if (
        account?.address &&
        (account.role === 'ADMIN' || account.role === 'CONTROLLER')
      ) {
        await getAllProjectInfo(account).then((res) => {
          setProjectAddresses(res[0]);
          setProjectNames(res[1]);
          setPassportHashes(res[2]);
          setMintStatuses(new Array(res[0].length).fill(1));
        });
      }
    })();
  }, [account?.address]);

  return (
    <ControllerTemp
      mintStatuses={mintStatuses}
      passportHashes={passportHashes}
      projectAddresses={projectAddresses}
      projectNames={projectNames}
      subtitle="Let mint UNCHAIN Passports to those who finished the challenges"
    />
  );
}
