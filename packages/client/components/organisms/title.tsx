import React from 'react';

import Address from '@/components/atoms/address';
import MainTitle from '@/components/atoms/mainTitle';
import Subtitle from '@/components/atoms/subtitle';
import { Screen } from '@/features/enum';

type Props = {
  screen: Screen;
  subtitle: string;
};

export default function Title(props: Props) {
  return (
    <div className="flex flex-row justify-between w-screen mt-2">
      <div className="flex text-white w-64" />
      <div className="flex items-center justify-center flex-col">
        <MainTitle />
        <Subtitle subtitle={props.subtitle} />
      </div>
      {props.screen === Screen.HOME ? (
        <div className="flex text-white w-64" />
      ) : (
        <div className="flex items-center flex-row text-2xl">
          <Address />
        </div>
      )}
    </div>
  );
}
