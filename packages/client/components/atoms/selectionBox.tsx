import React from 'react';

type Props = {
  textList: string[];
};

export default function SelectionBox(props: Props) {
  return (
    <div className="">
      <select className="h-10 W-10 rounded-sm flex items-center justify-center text-ellipsis overflow-hidden">
        {props.textList.map((text, i) => (
          <option key={i + 1}>{text}</option>
        ))}
      </select>
    </div>
  );
}
