import React from 'react';

import { Mode, Screen } from '@/features/enum';

type Props = {
  text: string;
  screen: Screen;
  mode: Mode | null;
  onClick: () => void;
};

export default function Button(props: Props) {
  return (
    <button
      onClick={() => {
        if (props.screen === Screen.HOME) {
          props.onClick();
        } else if (props.mode === Mode.MintNFT) {
          console.log('Mint NFT');
        } else if (props.mode === Mode.GrantRole) {
          console.log('Grant Mint-Role');
        } else if (props.mode === Mode.ADDCONTRACT) {
          props.onClick();
        } else {
          console.log('Add Controller');
        }
      }}
      className="text-4xl text-black items-center flex justify-center h-20 w-96 bg-gradient-to-b from-[#01AD30] to-[#FF3EF3] hover:bg-blue-700 rounded-xl"
    >
      {props.text}
    </button>
  );
}
