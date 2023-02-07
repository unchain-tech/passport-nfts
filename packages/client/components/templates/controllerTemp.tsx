import React, { useState } from 'react';
import { Mode, Screen } from '../../features/enum';
import Button from '../atoms/Button';
import RadioButton from '../atoms/radioButton';
import TextBoxGroup from '../organisms/textBoxGroup';
import TextTable from '../organisms/textTable';
import Title from '../organisms/title';

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
  return (
    <div className='center bg-black space-y-8 overflow-scroll '>
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
      <div className='flex flex-row justify-between items-center w-full'>
        <div className='w-1/5'/>
        <Button
          text={modeValue === Mode.MintNFT ? 'Mint NFT' : 'Grant Mint-Role'}
          isAdmin={null}
          screen={Screen.CONTROLLER}
          mode={modeValue}
        />
        <div className='text-white w-1/5'>
          <RadioButton passValue={passValue} />
        </div>
      </div>
    </div>
  );
}
