import React, { useLayoutEffect } from 'react'
import { Screen } from '../../features/enum'
import TextTable from '../organisms/textTable'
import Title from '../organisms/title'

type Props = {
  subtitle: string
  buttonName: string
  imgIdList: string[]
  mintStatusList: number[]
}
export default function MinterTemp(props: Props) {
  return (
    <div className='center bg-black space-y-8 overflow-scroll '>
      <Title subtitle={props.subtitle} screen={Screen.MINTER} />
      <TextTable
        imgIdList={props.imgIdList}
        itemNum={5}
        mintStatusList={props.mintStatusList}
        screen={Screen.MINTER}
      />
    </div>
  )
}
