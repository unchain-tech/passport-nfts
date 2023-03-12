import React from 'react';

import { readCSV } from '../../hooks/uiFunction';

export default function CsvReadButton() {
  return (
    <div className="h-10 flex items-center justify-center px-2 rounded-sm">
      <input
        type={'file'}
        name={'file'}
        accept={'.csv'}
        onChange={readCSV}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />
    </div>
  );
}
