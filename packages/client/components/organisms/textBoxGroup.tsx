import React from 'react'
import { Mode } from '../../features/enum'
import SelectionBox from '../atoms/selectionBox'
import AddAddressButton from '../molecules/addAddressButton'
import AddressBox from '../molecules/addressBox'
import ShowRecipientsButton from '../molecules/showRecipientsButton'

type Props = {
  address: string
  textList: string[]
  mode: Mode
}

export default function TextBoxGroup(props: Props) {
  return (
    <div className='flex flex-row space-x-4'>
      {props.mode == Mode.MintNFT ? (
        <div className='flex flex-row space-x-4'>
          <SelectionBox textList={props.textList} />
          <AddressBox />
          <AddAddressButton />
        </div>
      ) : (
        <button
          className='bg-white rounded-sm px-2'
          onClick={() => console.log('upload CSV File')}
        >
          upload CSV file
        </button>
      )}
      <ShowRecipientsButton />
    </div>
  )
}
