import React from 'react';

type Props = {
  inputValue: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function AddressBox(props: Props) {
  return (
    <div>
      <input
        id="addressBox"
        className="h-10"
        value={props.inputValue}
        onChange={props.onChange}
      />
    </div>
  );
}
