import Papa from 'papaparse';
import React, { useState } from 'react';

import Button from '@/components/atoms/Button';
import RadioButton from '@/components/atoms/radioButton';
import TextBoxGroup from '@/components/organisms/textBoxGroup';
import TextTable from '@/components/organisms/textTable';
import Title from '@/components/organisms/title';
import { Mode, Screen } from '@/features/enum';
import { useAccountContext } from '@/hooks/accountContext';
import { convertToProjectAddresses } from '@/hooks/uiFunction';
import addProject from '@/services/addProject';
import changeStatusToAvailable from '@/services/changeStatusToAvailable';
import grantControllerRole from '@/services/grantControllerRole';
import multiMint from '@/services/multiMint';

type Props = {
  mintStatuses: number[];
  passportHashes: string[];
  projectAddresses: string[];
  projectNames: string[];
  subtitle: string;
};
export default function ControllerTemp(props: Props) {
  const { account } = useAccountContext();
  const [modeValue, setModeValue] = useState(Mode.MintNFT);
  const [address, setAddress] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [projectIndex, setProjectIndex] = useState(0);
  const [projectNames, setProjectNames] = useState<string[]>([]);

  const passValue = (mode: Mode) => {
    setModeValue(mode);
  };

  const stateNameMap: { [key: number]: string } = {
    0: 'Mint NFT',
    1: 'Grant Mint-Role',
    2: 'Add Project',
    3: 'Add Controller',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  const handleChangeProject = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProjectIndex(Number(e.target.value));
  };

  const handleChangeCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: function (results: any) {
          // Create an array of each data
          const length = results.data.length;
          const projectNames = new Array<string>(length);
          const recipients = new Array<string>(length);
          for (let i = 0; i < length; i++) {
            projectNames[i] = results.data[i].project;
            recipients[i] = results.data[i].address;
          }
          // Save as state
          setProjectNames(projectNames);
          setRecipients(recipients);
        },
      });
    }
  };

  const handleAddAddress = () => {
    setRecipients([...recipients, address]);
    setAddress('');
  };

  const handleShowRecipients = () => {
    alert(recipients);
  };

  const handleMintNFT = async () => {
    if (account?.role !== 'ADMIN') {
      alert('You are not authorized.');
      return;
    }
    if (recipients.length === 0) {
      alert('Recipient is not set.');
      return;
    }
    try {
      const projectAddresses = convertToProjectAddresses(
        props.projectAddresses,
        props.projectNames,
        projectNames,
      );
      if (account) {
        await multiMint(account, projectAddresses, recipients);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProjectNames([]);
      setRecipients([]);
    }
  };

  const handleGrantRole = async () => {
    if (account?.role === 'NONE') {
      alert('You are not authorized.');
      return;
    }
    if (recipients.length === 0) {
      alert('Recipient is not set.');
      return;
    }
    if (account) {
      try {
        const projectAddress = props.projectAddresses[projectIndex];
        for (const recipient of recipients) {
          await changeStatusToAvailable(account, projectAddress, recipient);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setProjectIndex(0);
        setRecipients([]);
      }
    }
  };

  const handleAddProject = async () => {
    if (account?.role === 'NONE') {
      alert('You are not authorized.');
      return;
    }
    if (address === '') {
      alert('Project address is not set.');
      return;
    }
    if (account) {
      try {
        await addProject(account, address);
      } catch (error) {
        console.error(error);
      } finally {
        setAddress('');
      }
    }
  };

  const handleAddController = async () => {
    if (account?.role !== 'ADMIN') {
      alert('You are not authorized.');
      return;
    }
    if (address === '') {
      alert('Address is not set.');
      return;
    }
    if (account) {
      try {
        await grantControllerRole(account, address);
      } catch (error) {
        console.error(error);
      } finally {
        setAddress('');
      }
    }
  };

  const handleClick = () => {
    switch (modeValue) {
      case Mode.MintNFT:
        handleMintNFT();
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
        console.error('Error Mode');
        break;
    }
  };

  return (
    <div className="center bg-black space-y-8 overflow-scroll ">
      <Title subtitle={props.subtitle} screen={Screen.CONTROLLER} />
      <TextTable
        itemNum={4}
        mintStatuses={props.mintStatuses}
        passportHashes={props.passportHashes}
        screen={Screen.CONTROLLER}
      />
      <TextBoxGroup
        inputValue={address}
        mode={modeValue}
        projectNames={props.projectNames}
        onChange={handleChange}
        onChangeProject={handleChangeProject}
        onChangeCSVFile={handleChangeCSVFile}
        onClickAddAddress={handleAddAddress}
        onClickShowRecipients={handleShowRecipients}
      />
      <div className="flex flex-row justify-between items-center w-full">
        <div className="w-1/5" />
        <Button text={stateNameMap[modeValue]} onClick={handleClick} />
        <div className="text-white w-1/5">
          <RadioButton passValue={passValue} />
        </div>
      </div>
    </div>
  );
}
