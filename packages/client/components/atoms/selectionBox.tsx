import React from 'react';

type Props = {
  projectNames: string[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

export default function SelectionBox(props: Props) {
  return (
    <div className="">
      <select
        className="h-10 W-10 rounded-sm flex items-center justify-center text-ellipsis overflow-hidden"
        onChange={props.onChange}
      >
        {props.projectNames.map((projectName, index) => (
          <option key={index + 1} value={index}>
            {projectName}
          </option>
        ))}
      </select>
    </div>
  );
}
