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
      if (account?.address) {
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
      buttonName="Give Mint Roles"
      mintStatuses={mintStatuses}
      passportHashes={passportHashes}
      projectAddresses={projectAddresses}
      subtitle="Let mint UNCHAIN Passports to those who finished the challenges"
    />
  );
}
