import React from 'react';

type Props = {
  subtitle: string;
};

export default function Subtitle(props: Props) {
  return <div className="text-white text-3xl">{props.subtitle}</div>;
}
