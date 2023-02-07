import React, { useState } from 'react';

import { Mode } from '../../features/enum';

type Props = {
  passValue: (value: Mode) => void;
};

export default function RadioButton(props: Props) {
  const items: string[] = ['Mint NFT mode', 'Grant Mint-Role Mode'];

  const [selectedValue, setSelectedValue] = useState('Mint NFT mode');

  const handleChange = (e: { target: { id: string; value: string } }) => {
    setSelectedValue(e.target.id);
    props.passValue(e.target.value === '0' ? Mode.MintNFT : Mode.GrantRole);
    {
      console.log(e.target.value);
    }
  };
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <label key={item}>
          <input
            id={item}
            type="radio"
            value={item === 'Mint NFT mode' ? Mode.MintNFT : Mode.GrantRole}
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
