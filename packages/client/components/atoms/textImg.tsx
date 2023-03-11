import { MediaRenderer } from '@thirdweb-dev/react';
import Image from 'next/image';
import React from 'react';

type Props = {
  passportHash: string;
  mintStatus: number;
};

export default function TextImg(props: Props) {
  return (
    <div>
      <MediaRenderer
        src={`ipfs://${props.passportHash}`}
        alt="home_img"
        className={`w-52 h-52 ${
          props.mintStatus === 1 ? '' : 'opacity-40 blur-[2px]'
        }`}
      />
    </div>
  );
}
