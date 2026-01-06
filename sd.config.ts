import { kebabCase } from 'es-toolkit';
import StyleDictionary, { type Config } from 'style-dictionary';
import { formats, transforms, transformTypes } from 'style-dictionary/enums';
import { fileHeader } from 'style-dictionary/utils';
import type { ConfigExtension, DefaultClassGroupIds, DefaultThemeGroupIds } from 'tailwind-merge';

StyleDictionary.registerTransform({
  name: 'custom/shadow',
  type: transformTypes.value,
  transitive: true,
  filter: (token) => token.$type === 'shadow',
  transform: (token) => {
    if (typeof token.$value !== 'object') {
      // already transformed to string
      return token.$value;
    }

    const stringifyShadow = (val: any) => {
      // check if the shadows are objects, they might already be transformed to strings if they were refs
      if (typeof val !== 'object') {
        return val;
      }
      const { inset, color, offsetX, offsetY, blur, spread } = val;
      return `${inset ? `inset ` : ''}${offsetX ?? 0} ${offsetY ?? 0} ${blur ?? 0} ${
        spread ? `${spread} ` : ''
      }${color ?? `#000000`}`;
    };

    if (Array.isArray(token.$value)) {
      return token.$value.map(stringifyShadow).join(', ');
    }
    return stringifyShadow(token.$value);
  },
});

StyleDictionary.registerFormat({
  name: 'custom/components',
  format: async ({ dictionary }) => {
    const header = await fileHeader({});

    const nestInSelector = (content: string, selector: string) => {
      return `${selector} {\n` + content + `\n}`;
    };

    const content = dictionary.allTokens
      .map((token) => {
        const classNames = [];

        for (const [prop, { classRoot, classMap }] of Object.entries({
          fontFamily: {
            classRoot: 'font',
            classMap: {},
          },
          fontSize: {
            classRoot: 'text',
            classMap: {},
          },
          lineHeight: {
            classRoot: 'leading',
            classMap: {},
          },
          fontWeight: {
            classRoot: 'font',
            classMap: {},
          },
          letterSpacing: {
            classRoot: 'tracking',
            classMap: {},
          },
          textCase: {
            classRoot: null,
            classMap: {
              ORIGINAL: null,
              UPPER: 'uppercase',
              LOWER: 'lowercase',
              TITLE: null,
            },
          },
          fontStyle: {
            classRoot: null,
            classMap: {
              normal: null,
              italic: 'italic',
            },
          },
          textDecoration: {
            classRoot: null,
            classMap: {
              NONE: null,
              UNDERLINE: 'underline',
              STRIKETHROUGH: 'line-through',
            },
          },
        })) {
          const value: string = token.original.$value[prop];
          const prefix = classRoot ? `${classRoot}-` : '';

          if (value in classMap) {
            const className = (classMap as any)[value];

            if (className) {
              classNames.push(prefix + className);
            }
          } else if (typeof value === 'string' && value.includes('{')) {
            classNames.push(kebabCase(value));
          } else {
            classNames.push(prefix + `[${value}]`);
          }
        }

        return nestInSelector(`  @apply ${[...new Set(classNames)].join(' ')};`, `.${token.name}`);
      })
      .join('\n\n');

    return header + content + '\n';
  },
});

StyleDictionary.registerFormat({
  name: 'custom/tailwind-merge',
  format: async ({ dictionary }) => {
    const config = {
      override: {
        theme: {
          leading: ['none'],
        } as Record<DefaultThemeGroupIds, string[]>,
      },
      extend: {
        theme: {} as Record<DefaultThemeGroupIds, string[]>,
      },
    } satisfies ConfigExtension<DefaultClassGroupIds, DefaultThemeGroupIds>;

    for (const token of dictionary.allTokens) {
      const themeKey = token.path.at(0);
      const name = kebabCase(token.path.slice(1).join(' '));

      switch (themeKey) {
        case 'blur':
        case 'drop-shadow':
        case 'font-weight':
        case 'inset-shadow':
        case 'leading':
        case 'radius':
        case 'shadow':
        case 'text':
        case 'tracking': {
          (config.override.theme[themeKey] ??= []).push(name);
          break;
        }

        case 'spacing': {
          (config.extend.theme[themeKey] ??= []).push(name);
          break;
        }
      }
    }

    return JSON.stringify(config, null, 2) + '\n';
  },
});

const config: Config = {
  source: ['./packages/ui/tokens/*.tokens.json', './packages/themes/*/tokens/*.tokens.json'],
  platforms: {
    ...Object.fromEntries(
      [
        'default',
        // 'brand-1',
        // 'brand-2',
      ].map((themeKey) => [
        `theme/${themeKey}`,
        {
          transforms: [transforms.nameKebab, transforms.fontFamilyCss, 'custom/shadow'],
          files: [
            {
              destination: `./packages/themes/${themeKey}/theme.generated.css`,
              format: formats.cssVariables,
              filter: ({ filePath }) =>
                filePath === `packages/themes/${themeKey}/tokens/theme.tokens.json`,
            },
          ],
          options: {
            selector: ['@theme'],
            outputReferences: true,
          },
        },
      ]),
    ),
    components: {
      transforms: [transforms.nameKebab, transforms.fontFamilyCss],
      files: [
        {
          destination: './packages/ui/components.generated.css',
          format: 'custom/components',
          filter: ({ filePath }) => filePath === 'packages/ui/tokens/components.tokens.json',
        },
      ],
    },
    tailwindMerge: {
      transforms: [transforms.nameKebab],
      files: [
        {
          destination: './packages/ui/src/tailwind-merge-config.json',
          format: 'custom/tailwind-merge',
          filter: ({ filePath }) => filePath === 'packages/themes/default/tokens/theme.tokens.json',
        },
      ],
    },
  },
};

export default config;
