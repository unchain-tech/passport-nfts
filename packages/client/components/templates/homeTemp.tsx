import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

import Button from '@/components/atoms/Button';
import Title from '@/components/organisms/title';
import { Screen } from '@/features/enum';
import { useAccountContext } from '@/hooks/accountContext';

type Props = {
  buttonName: string;
  imgUrl: string;
  subtitle: string;
};

export default function HomeTemp(props: Props) {
  const router = useRouter();
  const { connectWallet } = useAccountContext();

  const handleConnectWallet = async () => {
    if (connectWallet) {
      await connectWallet().then((account) => {
        if (account?.role !== 'CHECKING' && account?.role === 'NONE') {
          alert('You are not authorized.');
          return;
        }
        router.push('controller');
      });
    }
  };

  return (
    <div className="center bg-black space-y-8 overflow-scroll">
      <Title subtitle={props.subtitle} screen={Screen.HOME} />
      <Image src={props.imgUrl} alt="home_img" width={750} height={700} />
      <Button text={props.buttonName} onClick={handleConnectWallet} />
    </div>
  );
}
