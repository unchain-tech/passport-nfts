import React from 'react';

import Text from '@/components/molecules/text';
import { Screen } from '@/features/enum';
import { divideList } from '@/hooks/uiFunction';

type Props = {
  imgIdList: string[];
  itemNum: number;
  mintStatusList: number[];
  screen: Screen;
  onClick?: (passportHash: string) => void;
};

export default function TextTable(props: Props) {
  return (
    <div
      className={`overflow-scroll ${
        props.screen === Screen.MINTER ? 'h-4/5' : 'h-1/2'
      } border-solid border-2 border-white scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[#00DC16] scrollbar-track-gray-100`}
    >
      {divideList(props.imgIdList, props.itemNum).map((imgIdList, i) => (
        <div className="flex flex-row" key={i + 1}>
          {imgIdList.map((imgId, j) => (
            <Text
              imgId={imgId}
              key={4 * i + j}
              mintStatus={props.mintStatusList[4 * i + j]}
              screen={props.screen}
              onClick={props.onClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
