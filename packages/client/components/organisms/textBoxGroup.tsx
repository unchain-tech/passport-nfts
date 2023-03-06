import React from 'react';

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
        </div>
      );
    case Mode.GrantRole:
      return (
        <button
          className="bg-white rounded-sm px-2"
          onClick={() => console.log('upload CSV File')}
        >
          upload CSV file
        </button>
      );
    case Mode.ADDCONTRACT:
      return (
        <div className="flex flex-raw space-x-5">
          <AddressBox />
          <button
            className="bg-white rounded-sm px-2"
            onClick={() => console.log('add contract address')}
          >
            add contract
          </button>
        </div>
      );
  }
}

export default function TextBoxGroup(props: Props) {
  return (
    <div className="flex flex-row space-x-4">
      {switchContent(props.mode, props.textList)}
      <ShowRecipientsButton />
    </div>
  );
}
