import React from 'react';

import { useAccountContext } from '@/hooks/accountContext';

export default function Address() {
  const { account } = useAccountContext();

  return (
    <div className="flex flex-row w-64 justify-center text-[#49A9EE] underline">
      <div>wallet address:</div>
      <div className="w-10 text-ellipsis overflow-hidden">
        {account?.address}
      </div>
    </div>
  );
}
