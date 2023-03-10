import React, { useState } from 'react';

import Button from '@/components/atoms/Button';
import RadioButton from '@/components/atoms/radioButton';
import TextBoxGroup from '@/components/organisms/textBoxGroup';
import TextTable from '@/components/organisms/textTable';
import Title from '@/components/organisms/title';
import { Mode, Screen } from '@/features/enum';
import { useAccountContext } from '@/hooks/accountContext';
import addProject from '@/services/addProject';
import changeStatusToAvailable from '@/services/changeStatusToAvailable';
import grantControllerRole from '@/services/grantControllerRole';

type Props = {
  subtitle: string;
  imgIdList: string[];
  mintStatusList: number[];
  address: string;
  projectAddresses: string[];
  textList: string[];
};
export default function ControllerTemp(props: Props) {
  const { account } = useAccountContext();
  const [modeValue, setModeValue] = useState(Mode.MintNFT);
  const [address, setAddress] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [projectIndex, setProjectIndex] = useState(0);
  const passValue = (mode: Mode) => {
    setModeValue(mode);
  };

  const stateNameMap: { [key: number]: string } = {
    0: 'Mint NFT',
    1: 'Grant Mint-Roll',
    2: 'Add Project',
    3: 'Add Controller',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  const handleChangeProject = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(`select Element: ${e.target.value}`);
    setProjectIndex(Number(e.target.value));
  };

  const handleAddAddress = () => {
    setRecipients([...recipients, address]);
    setAddress('');
  };

  const handleShowRecipients = () => {
    alert(recipients);
  };

  const handleGrantRole = async () => {
    if (recipients.length === 0) {
      alert('Recipient is not set.');
      return;
    }
    if (account) {
      try {
        const result = confirm(`Project: ${props.textList[projectIndex]}`);
        if (result) {
          const projectAddress = props.projectAddresses[projectIndex];
          for (const recipient of recipients) {
            await changeStatusToAvailable(account, projectAddress, recipient);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setProjectIndex(0);
        setRecipients([]);
      }
    }
  };

  const handleAddProject = async () => {
    if (account) {
      try {
        await addProject(account, address);
      } catch (error) {
        console.log(error);
      } finally {
        setAddress('');
      }
    }
  };

  const handleAddController = async () => {
    if (account) {
      try {
        await grantControllerRole(account, address);
      } catch (error) {
        console.log(error);
        alert(error);
      } finally {
        setAddress('');
      }
    }
  };

  const handleClick = () => {
    switch (modeValue) {
      case Mode.MintNFT:
        break;
      case Mode.GrantRole:
        handleGrantRole();
        break;
      case Mode.AddProject:
        handleAddProject();
        break;
      case Mode.AddController:
        handleAddController();
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
        inputValue={address}
        onChange={handleChange}
        onChangeProject={handleChangeProject}
        onClickAddAddress={handleAddAddress}
        onClickShowRecipients={handleShowRecipients}
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
