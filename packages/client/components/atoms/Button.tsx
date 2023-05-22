import React from 'react';

type Props = {
  text: string;
  onClick: () => void;
};

export default function Button(props: Props) {
  return (
    <button
      onClick={() => props.onClick()}
      className="text-4xl text-black items-center flex justify-center h-20 w-96 bg-gradient-to-b from-[#01AD30] to-[#FF3EF3] hover:bg-blue-700 rounded-xl"
    >
      {props.text}
    </button>
  );
}
