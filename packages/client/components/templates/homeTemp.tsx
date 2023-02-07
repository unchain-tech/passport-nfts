import Image from 'next/image';
import React from 'react';

import Button from '@/components/atoms/Button';
import Title from '@/components/organisms/title';
import { Screen } from '@/features/enum';

type Props = {
  subtitle: string;
  imgUrl: string;
  buttonName: string;
  isAdmin: boolean;
};

export default function HomeTemp(props: Props) {
  return (
    <div className="center bg-black space-y-8 overflow-scroll">
      <Title subtitle={props.subtitle} screen={Screen.HOME} />
      <Image src={props.imgUrl} alt="home_img" width={750} height={700} />
      <Button
        text={props.buttonName}
        isAdmin={props.isAdmin}
        screen={Screen.HOME}
        mode={null}
      />
    </div>
  );
}
