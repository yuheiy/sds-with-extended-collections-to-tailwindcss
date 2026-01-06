import { extendTailwindMerge } from 'tailwind-merge';
import type { TV } from 'tailwind-variants';
import { tv as tvBase } from 'tailwind-variants';
import twMergeConfig from './tailwind-merge-config.json';

export const twMerge = extendTailwindMerge(twMergeConfig);

export const tv: TV = (options, config) =>
  tvBase(options, {
    ...config,
    twMerge: config?.twMerge ?? true,
    twMergeConfig: config?.twMergeConfig ?? twMergeConfig,
  });
