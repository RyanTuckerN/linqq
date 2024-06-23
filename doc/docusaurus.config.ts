import {themes as prismThemes} from 'prism-react-renderer';
import path from 'path';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  //TODO:
  favicon: 'img/favicon.ico',
  url: 'https://RyanTuckerN.github.io',
  baseUrl: '/linqq',
  title: 'linqq',
  tagline: 'Why use arrays when you can use linqq?',
  organizationName: 'RyanTuckerN', // Usually your GitHub org/user name.
  projectName: 'linqq',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    ['docusaurus-plugin-typedoc-api',
      {
        projectRoot: path.join(__dirname, '..'),
        packages: ['.'],
        exclude: ['**/node_modules/**', './enumerables'],
				minimal: false,
				readmes: true,
				debug: false,
			},
    ],
  ],
  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'linqq',
      logo: {
        alt: 'linqq logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'api',
          label: 'API',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} linqq. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.duotoneDark,
      darkTheme: prismThemes.nightOwl,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
