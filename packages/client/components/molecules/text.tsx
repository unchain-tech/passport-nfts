import React from 'react';

import TextImg from '@/components/atoms/textImg';
import { Screen } from '@/features/enum';

type Props = {
  imgId: string;
  mintStatus: number;
  screen: Screen;
  onClick?: (passportHash: string) => void;
};

export default function Text(props: Props) {
  return (
    <div className="relative">
      <TextImg imgId={props.imgId} mintStatus={props.mintStatus} />
      <div
        className="w-52 h-52 absolute top-0 left-0 flex justify-center items-center flex-col text-2xl text-red-500"
        onClick={() => {
          if (props.mintStatus === 1 && props.screen === Screen.MINTER) {
            const result = confirm(
              "Would you like to mint this project's NFT?",
            );
            if (result && props.onClick) {
              props.onClick(props.imgId);
            }
          }
        }}
        onKeyDown={() => {}}
      >
        <div className="text-red-400">{`${
          props.mintStatus === 0 ? 'not' : ''
        }`}</div>
        <div className="text-red-400">{`${
          props.mintStatus === 0 ? 'cleared' : ''
        }`}</div>
        <div className="text-green-400">{`${
          props.mintStatus === 2 ? 'already' : ''
        }`}</div>
        <div className="text-green-400">{`${
          props.mintStatus === 2 ? 'minted' : ''
        }`}</div>
      </div>
    </div>
  );
}
