import React from 'react';

import CsvReadButton from '../molecules/csvReadButton';

import SelectionBox from '@/components/atoms/selectionBox';
import AddAddressButton from '@/components/molecules/addAddressButton';
import AddressBox from '@/components/molecules/addressBox';
import ShowRecipientsButton from '@/components/molecules/showRecipientsButton';
import { Mode } from '@/features/enum';

type Props = {
  address: string;
  textList: string[];
  mode: Mode;
  inputValue: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onChangeProject: React.ChangeEventHandler<HTMLSelectElement>;
  onChangeCSVFile: React.ChangeEventHandler<HTMLInputElement>;
  onClickAddAddress: () => void;
  onClickShowRecipients: () => void;
};

function switchContent(props: Props) {
  switch (props.mode) {
    case Mode.MintNFT:
      return (
        <div className="flex flex-row space-x-4">
          <CsvReadButton onChange={props.onChangeCSVFile} />
          <ShowRecipientsButton onClick={props.onClickShowRecipients} />
        </div>
      );
    case Mode.GrantRole:
      return (
        <div className="flex flex-row space-x-4">
          <SelectionBox
            textList={props.textList}
            onChange={props.onChangeProject}
          />
          <AddressBox inputValue={props.inputValue} onChange={props.onChange} />
          <AddAddressButton
            value={props.inputValue}
            onClick={props.onClickAddAddress}
          />
          <ShowRecipientsButton onClick={props.onClickShowRecipients} />
        </div>
      );
    case Mode.AddProject:
      return (
        <AddressBox inputValue={props.inputValue} onChange={props.onChange} />
      );
    case Mode.AddController:
      return (
        <AddressBox inputValue={props.inputValue} onChange={props.onChange} />
      );
  }
}

export default function TextBoxGroup(props: Props) {
  return <div className="flex flex-row space-x-4">{switchContent(props)}</div>;
}
