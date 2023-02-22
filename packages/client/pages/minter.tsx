import React from 'react';

import MinterTemp from '@/components/templates/minterTemp';

const imgIdList: string[] = [
  'QmXk3kdRvV6TV9yZvtZPgKHoYmywnURy3Qhs8Bjo5szg1J',
  'QmbboPHPWPn7Fm9ULTKppC4AkeLGG8SimEPXgCM3Hr5eWN',
  'Qmcs93RjJCsBmrW5iiaaQzwPv8pq2F5TdquPJ2frstStMP',
  'QmXjWn9oRRzE4XkxCWM3XokWKJqkghkZmg8ox2w87pB2n9',
  'QmcKaf9bLvMAzjAwYXwAQTaQVvtkffFKfpBRpGgBP71c1p',
  'Qma3C4TyC7Msb8XfLbaB26PMmqyPL3UqwZ9dJL19nEy3AD',
  'QmUCZwUTTpZdSoZ9Lqe8bsqJ8EnpEsphYwSBEFc7kXfzt6',
  'QmWBW84E55XWATezgNjDBdnzaC815NRAfCx8FzsJqMjsRd',
  'QmXjWn9oRRzE4XkxCWM3XokWKJqkghkZmg8ox2w87pB2n9',
  'QmYLUcnkS2URjxrdvutdyKk5FvQgmG6WXbq8H9pJdSqL27',
  'QmZKpqK3Vn4GViQoCFqE7NfobWvprFch4qrFaK21zf5RWp',
  'QmYK1uqMzqtgpEi5MqWqdAMemoopSKf2rswKjhR2w3wBNH',
  'QmPGi1a3KgSyop4rj2oaYdd9x7cbMXj9VMunQNSykzd5ds',
  'QmTMBFX6deyz2sqa92RDPTKrkxo7B3ZDw8YrSBuxbbxo7f',
  'QmY4DbEFVo13wytcyXZk9Zxr5Lnzc9fn3W9CuAn1VqRZKx',
  'QmRbFSiZUCAdKSB3dsZzVWUThpTJURFhMHhm2hr6rw8GfH',
  'QmQW79bjqFwfeVY3TxrhFJh9WRen9mBTkL4vnntimPXqBw',
  'QmQtv57r5BJDCr9LmjVayvzoyDNvxyPgGBebDq3ZACVA33',
  'QmcHjSFh3cZRktgokeKn5QiGSrgG66nELruY5VXLUFyBUm',
  'QmeCP9NaqBKPJroZMCGaMnd73zXPcEKrUPDFHSWfuaYkYv',
  'QmXYADTkQEoEk88Gx4KkqZBVkKyiZq8nkMoAzN1gAxNKqi',
  'QmYkdzfNrVnN3qsDXY3UGbemg7x1ezE2kdtdsZznPv6cjb',
];

const mintStatusList: number[] = [
  0, 1, 2, 0, 1, 2, 2, 2, 1, 0, 0, 1, 2, 0, 1, 2, 2, 2, 1, 0, 1, 0,
];

export default function Minter() {
  return (
    <MinterTemp
      subtitle="Let mint UNCHAIN Passports to those who finished the challenges"
      buttonName="Give Mint Roles"
      imgIdList={imgIdList}
      mintStatusList={mintStatusList}
    />
  );
}
