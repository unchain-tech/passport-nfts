const path = require('path');

const buildLintCommand = (filenames) =>
  `yarn run rome check ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

const buildFormatCommand = (filenames) =>
  `yarn run rome format ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')} `;

const buildSolhintCommand = (filenames) =>
  `solhint --max-error 0 --ignore-path packages/contract/.solhintignore ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')} `;

const buildPrettierCommand = (filenames) =>
  `prettier --ignore-unknown --no-error-on-unmatched-pattern --ignore-path packages/contract/.prettierignore --check ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')} `;

module.exports = {
  '**/*.{js,jsx,ts,tsx}': [buildLintCommand],
  '**/*.{js,jsx,ts,tsx}': [buildFormatCommand],
  '**/*.sol': [buildSolhintCommand],
  '**/*.sol': [buildPrettierCommand],
};