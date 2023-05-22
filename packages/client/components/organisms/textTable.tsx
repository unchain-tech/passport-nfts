import React from 'react';

import Text from '@/components/molecules/text';
import { Screen } from '@/features/enum';
import { divideList } from '@/hooks/uiFunction';

type Props = {
  itemNum: number;
  mintStatuses: number[];
  passportHashes: string[];
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
      {divideList(props.passportHashes, props.itemNum).map(
        (passportHashes, i) => (
          <div className="flex flex-row" key={i + 1}>
            {passportHashes.map((passportHash, j) => (
              <Text
                passportHash={passportHash}
                key={props.itemNum * i + j}
                mintStatus={props.mintStatuses[props.itemNum * i + j]}
                screen={props.screen}
                onClick={props.onClick}
              />
            ))}
          </div>
        ),
      )}
    </div>
  );
}
