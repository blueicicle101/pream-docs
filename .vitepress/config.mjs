import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Pream Documentation',
  description: 'High-performance IPTV Playlist Manager & Xtream Codes API Gateway',
  base: '/pream-docs/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    siteTitle: '📡 Pream',
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Deployment', link: '/deployment' },
      { text: 'Clients', link: '/clients' },
      { text: 'Rules Engine', link: '/rules-engine' },
      { text: 'Screenshots', link: '/SCREENSHOTS' },
      { text: 'FAQ', link: '/faq' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview & Architecture', link: '/index' },
          { text: 'Quick Start Guide', link: '/getting-started' },
          { text: 'Docker & Podman Deployment', link: '/deployment' },
        ],
      },
      {
        text: 'Core Features',
        items: [
          { text: 'Connecting IPTV Players', link: '/clients' },
          { text: 'Managing Sources', link: '/sources' },
          { text: 'Rules Engine & Filtering', link: '/rules-engine' },
        ],
      },
      {
        text: 'Media & Support',
        items: [
          { text: 'Screenshots & UI', link: '/SCREENSHOTS' },
          { text: 'Advanced Integrations', link: '/advanced' },
          { text: 'FAQ & Troubleshooting', link: '/faq' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/pream' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Pream Project',
    },
  },
})
