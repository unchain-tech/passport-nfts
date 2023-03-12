import { useRouter } from 'next/router';
import React from 'react';

import { Mode, Screen } from '@/features/enum';

type Props = {
  text: string;
  isAdmin: boolean | null;
  screen: Screen;
  mode: Mode | null;
};

export default function Button(props: Props) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (props.screen === Screen.HOME) {
          props.isAdmin ? router.push('controller') : router.push('/minter');
        } else if (props.mode === Mode.MintNFT) {
          console.log('Mint NFT');
        } else if (props.mode === Mode.GrantRole) {
          console.log('Grant Mint-Role');
        } else {
          console.log('Add Contract');
        }
      }}
      className="text-4xl text-black items-center flex justify-center h-20 w-96 bg-gradient-to-b from-[#01AD30] to-[#FF3EF3] hover:bg-blue-700 rounded-xl"
    >
      {props.text}
    </button>
  );
}
