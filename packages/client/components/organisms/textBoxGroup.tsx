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
};

function switchContent(mode: Mode, textList: string[]) {
  switch (mode) {
    case Mode.MintNFT:
      return (
        <div className="flex flex-row space-x-4">
          <SelectionBox textList={textList} />
          <AddressBox />
          <AddAddressButton />
          <ShowRecipientsButton />
        </div>
      );
    case Mode.GrantRole:
      return (
        <div className="flex flex-row space-x-4">
          <button
            className="bg-white rounded-sm px-2"
            onClick={() => console.log('upload CSV File')}
          >
            upload CSV file
          </button>
          <ShowRecipientsButton />
        </div>
      );
    case Mode.ADDCONTRACT:
      return (
        <div className="flex flex-raw space-x-5">
          <CsvReadButton />
        </div>
      );
  }
}

export default function TextBoxGroup(props: Props) {
  return (
    <div className="flex flex-row space-x-4">
      {switchContent(props.mode, props.textList)}
    </div>
  );
}
