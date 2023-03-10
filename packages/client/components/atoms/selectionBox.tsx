import React from 'react';

type Props = {
  textList: string[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

export default function SelectionBox(props: Props) {
  return (
    <div className="">
      <select
        className="h-10 W-10 rounded-sm flex items-center justify-center text-ellipsis overflow-hidden"
        onChange={props.onChange}
      >
        {props.textList.map((text, index) => (
          <option key={index + 1} value={index}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
