import React from 'react'

type Props = {
  text: string
}

export default function TextBox(props: Props) {
  return (
    <div className='text-black h-10 flex items-center justify-center px-2 bg-white rounded-sm'>
      {props.text}
    </div>
  )
}
