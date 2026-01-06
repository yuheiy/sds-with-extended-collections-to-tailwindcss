import type { Config } from 'prettier';

const config: Config = {
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-css-order',
    'prettier-plugin-tailwindcss',
  ],
  printWidth: 100,
  singleQuote: true,

  // prettier-plugin-tailwindcss
  tailwindStylesheet: './apps/web/src/index.css',
  tailwindFunctions: ['cn', 'tv', 'twMerge'],
};

export default config;
