import React from 'react';

import TextBox from '@/components/atoms/textBox';

type Props = {
  value: string;
  onClick: () => void;
};

export default function AddAddressButton(props: Props) {
  return (
    <div>
      <button disabled={props.value === ''} onClick={() => props.onClick()}>
        <TextBox text="Add Address" />
      </button>
    </div>
  );
}
