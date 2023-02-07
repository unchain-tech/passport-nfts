import React from 'react';
import { Screen } from '../../features/enum';
import Address from '../atoms/address';
import MainTitle from '../atoms/mainTitle';
import Subtitle from '../atoms/subtitle';

type Props = {
  subtitle: string;
  screen: Screen;
};

export default function Title(props: Props) {
  return (
    <div className='flex flex-row justify-between w-screen mt-2'>
      <div className='flex text-white w-64'/>
      <div className='flex items-center justify-center flex-col'>
        <MainTitle />
        <Subtitle subtitle={props.subtitle} />
      </div>
      {props.screen === Screen.HOME ? (
        <div className='flex text-white w-64'/>
      ) : (
        <div className='flex items-center flex-row text-2xl'>
          <Address address='21321' />
        </div>
      )}
    </div>
  );
}
