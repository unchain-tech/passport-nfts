import React, { useLayoutEffect } from 'react';

import TextTable from '@/components/organisms/textTable';
import Title from '@/components/organisms/title';
import { Screen } from '@/features/enum';

type Props = {
  subtitle: string;
  buttonName: string;
  imgIdList: string[];
  mintStatusList: number[];
};
export default function MinterTemp(props: Props) {
  return (
    <div className="center bg-black space-y-8 overflow-scroll ">
      <Title subtitle={props.subtitle} screen={Screen.MINTER} />
      <TextTable
        imgIdList={props.imgIdList}
        itemNum={5}
        mintStatusList={props.mintStatusList}
        screen={Screen.MINTER}
      />
    </div>
  );
}
