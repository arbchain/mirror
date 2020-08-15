module.exports = {
  title: 'Mirror Besu',
  tagline: 'A tool for Hyperledger Besu',
  url: 'https://arbchain.github.io',
  baseUrl: '/',
  onBrokenLinks: 'ignore',
  favicon: 'img/favicon.ico',
  organizationName: 'arbchain', // Usually your GitHub org/user name.
  projectName: 'mirror', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Besu Mirror',
      logo: {
        alt: 'Besu Mirror',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://github.com/arbchain/mirror',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Consenso Labs',
              href: 'https://consensolabs.com',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/consensolabs',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/arbchain/mirror',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Consenso Labs, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'overview',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
