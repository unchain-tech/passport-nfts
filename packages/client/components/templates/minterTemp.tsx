import React from 'react';

import TextTable from '@/components/organisms/textTable';
import Title from '@/components/organisms/title';
import { Screen } from '@/features/enum';
import { useAccountContext } from '@/hooks/accountContext';
import mint from '@/services/mint';

type Props = {
  subtitle: string;
  buttonName: string;
  imgIdList: string[];
  mintStatusList: number[];
  projectAddresses: string[];
};
export default function MinterTemp(props: Props) {
  const { account } = useAccountContext();

  const handleMint = async (passportHash: string) => {
    if (account) {
      const projectAddress =
        props.projectAddresses[props.imgIdList.indexOf(passportHash)];
      try {
        await mint(account, projectAddress);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="center bg-black space-y-8 overflow-scroll ">
      <Title subtitle={props.subtitle} screen={Screen.MINTER} />
      <TextTable
        imgIdList={props.imgIdList}
        itemNum={5}
        mintStatusList={props.mintStatusList}
        screen={Screen.MINTER}
        onClick={handleMint}
      />
    </div>
  );
}
