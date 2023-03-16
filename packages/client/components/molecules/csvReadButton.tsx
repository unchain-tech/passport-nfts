import React from 'react';

type Props = {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function CsvReadButton(props: Props) {
  return (
    <div className="h-10 flex items-center justify-center px-2 rounded-sm">
      <input
        type={'file'}
        name={'file'}
        accept={'.csv'}
        onChange={props.onChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />
    </div>
  );
}
