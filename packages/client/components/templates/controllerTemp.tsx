import React, { useState } from 'react';

import Button from '@/components/atoms/Button';
import RadioButton from '@/components/atoms/radioButton';
import TextBoxGroup from '@/components/organisms/textBoxGroup';
import TextTable from '@/components/organisms/textTable';
import Title from '@/components/organisms/title';
import { Mode, Screen } from '@/features/enum';
import { useAccountContext } from '@/hooks/accountContext';
import addProject from '@/services/addProject';

type Props = {
  subtitle: string;
  imgIdList: string[];
  mintStatusList: number[];
  address: string;
  textList: string[];
};
export default function ControllerTemp(props: Props) {
  const { account } = useAccountContext();
  const [modeValue, setModeValue] = useState(Mode.MintNFT);
  const [projectAddress, setProjectAddress] = useState('');

  const passValue = (mode: Mode) => {
    setModeValue(mode);
  };

  const stateNameMap: { [key: number]: string } = {
    0: 'Mint NFT',
    1: 'Grant Mint-Roll',
    2: 'Add Contract',
    3: 'Add Controller',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProjectAddress(e.target.value);

  const handleAddProject = async () => {
    if (account) {
      try {
        await addProject(account, projectAddress);
      } catch (error) {
        console.log(error);
      } finally {
        setProjectAddress('');
      }
    }
  };

  const handleClick = () => {
    switch (modeValue) {
      case Mode.MintNFT:
        break;
      case Mode.GrantRole:
        break;
      case Mode.ADDCONTRACT:
        handleAddProject();
        break;
      default:
        console.log('Error Mode');
        break;
    }
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
        onChange={handleChange}
      />
      <div className="flex flex-row justify-between items-center w-full">
        <div className="w-1/5" />
        <Button
          text={stateNameMap[modeValue]}
          screen={Screen.CONTROLLER}
          mode={modeValue}
          onClick={handleClick}
        />
        <div className="text-white w-1/5">
          <RadioButton passValue={passValue} />
        </div>
      </div>
    </div>
  );
}
