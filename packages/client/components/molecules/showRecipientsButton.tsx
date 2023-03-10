import React from 'react';

import TextBox from '@/components/atoms/textBox';

type Props = {
  onClick: () => void;
};

export default function ShowRecipientsButton(props: Props) {
  return (
    <div>
      <button onClick={() => props.onClick()}>
        <TextBox text="show recipients" />
      </button>
    </div>
  );
}
