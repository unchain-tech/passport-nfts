import React, { useEffect, useState } from 'react';

import MinterTemp from '@/components/templates/minterTemp';
import { useAccountContext } from '@/hooks/accountContext';
import getUserProjectInfoAll from '@/services/getUserProjectInfoAll';

export default function Minter() {
  const { account } = useAccountContext();
  const [projectAddresses, setProjectAddresses] = useState<string[]>([]);
  const [passportHashes, setPassportHashes] = useState<string[]>([]);
  const [mintStatuses, setMintStatuses] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      if (account) {
        await getUserProjectInfoAll(account).then((res) => {
          setProjectAddresses(res[0]);
          setPassportHashes(res[1]);
          setMintStatuses(res[2]);
        });
      }
    })();
  }, [account?.address]);

  return (
    <MinterTemp
      subtitle="Let mint UNCHAIN Passports to those who finished the challenges"
      buttonName="Give Mint Roles"
      imgIdList={passportHashes}
      mintStatusList={mintStatuses}
      projectAddresses={projectAddresses}
    />
  );
}
