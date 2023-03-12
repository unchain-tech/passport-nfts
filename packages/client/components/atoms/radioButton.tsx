import React, { useState } from 'react';

import { Mode } from '../../features/enum';

type Props = {
  passValue: (value: Mode) => void;
};

export default function RadioButton(props: Props) {
  const items: string[] = [
    'Mint NFT Mode',
    'Grant Mint-Role Mode',
    'Add Contract Mode',
    'Add Controller Mode',
  ];

  const [selectedValue, setSelectedValue] = useState('Mint NFT Mode');
  const stateNameMap: { [key: string]: Mode } = {
    '0': Mode.MintNFT,
    '1': Mode.GrantRole,
    '2': Mode.ADDCONTRACT,
    '3': Mode.ADDCONTROLLER,
  };

  const handleChange = (e: { target: { id: string; value: string } }) => {
    setSelectedValue(e.target.id);
    props.passValue(stateNameMap[e.target.value]);
  };
  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <label key={item}>
          <input
            id={item}
            type="radio"
            value={stateNameMap[index.toString()]}
            onChange={handleChange}
            checked={item === selectedValue}
            key={item}
          />
          {item}
        </label>
      ))}
    </div>
  );
}
