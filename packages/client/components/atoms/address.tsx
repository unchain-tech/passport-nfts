import React from 'react';
type Props = {
  address: string;
};

export default function Address(props: Props) {
  return (
    <div className='flex flex-row w-64 justify-center text-[#49A9EE] underline'>
      <div>wallet address:</div>
      <div className='w-10 text-ellipsis overflow-hidden'>{props.address}</div>
    </div>
  );
}
