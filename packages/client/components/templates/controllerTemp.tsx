import React, { useState } from 'react';

import Button from '@/components/atoms/Button';
import RadioButton from '@/components/atoms/radioButton';
import TextBoxGroup from '@/components/organisms/textBoxGroup';
import TextTable from '@/components/organisms/textTable';
import Title from '@/components/organisms/title';
import { Mode, Screen } from '@/features/enum';

type Props = {
  subtitle: string;
  imgIdList: string[];
  mintStatusList: number[];
  address: string;
  textList: string[];
};
export default function ControllerTemp(props: Props) {
  const passValue = (mode: Mode) => {
    setModeValue(mode);
  };

  const [modeValue, setModeValue] = useState(Mode.MintNFT);

  const stateNameMap: { [key: number]: string } = {
    0: 'Mint NFT',
    1: 'Grant Mint-Roll',
    2: 'Add Contract',
    3: 'Add Controller',
  };
  return (
    <div className="center bg-black space-y-8 overflow-scroll ">
      <Title subtitle={props.subtitle} screen={Screen.CONTROLLER} />
      <TextTable
        imgIdList={props.imgIdList}
        itemNum={4}
        mintStatusList={props.mintStatusList}
        screen={Screen.CONTROLLER}
      />
      <TextBoxGroup
        address={props.address}
        textList={props.textList}
        mode={modeValue}
      />
      <div className="flex flex-row justify-between items-center w-full">
        <div className="w-1/5" />
        <Button
          text={stateNameMap[modeValue]}
          screen={Screen.CONTROLLER}
          mode={modeValue}
        />
        <div className="text-white w-1/5">
          <RadioButton passValue={passValue} />
        </div>
      </div>
    </div>
  );
}
