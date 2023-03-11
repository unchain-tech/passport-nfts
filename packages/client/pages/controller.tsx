import React, { useEffect, useState } from 'react';

import ControllerTemp from '@/components/templates/controllerTemp';
import { useAccountContext } from '@/hooks/accountContext';
import getAllProjectInfo from '@/services/getAllProjectInfo';

export default function Controller() {
  const { account } = useAccountContext();
  const [projectAddresses, setProjectAddresses] = useState<string[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [passportHashes, setPassportHashes] = useState<string[]>([]);

  const mintStatuses: number[] = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ];

  useEffect(() => {
    (async () => {
      if (account) {
        await getAllProjectInfo(account).then((res) => {
          setProjectAddresses(res[0]);
          setProjectNames(res[1]);
          setPassportHashes(res[2]);
          console.log(`get Project num: ${res.length}`); // TODO: Delete
        });
      }
    })();
  }, [account?.address]);

  return (
    <ControllerTemp
      subtitle="Let mint UNCHAIN Passports to those who finished the challenges"
      passportHashes={passportHashes}
      mintStatuses={mintStatuses}
      projectAddresses={projectAddresses}
      textList={projectNames}
    />
  );
}
