// Mintlify loads this script on every page. Keep the original assets from
// landing PR #69 alongside the favicon sizes Mintlify generates from docs.json.
(() => {
  const links = [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '96x96',
      href: '/favicon/favicon-96x96.png',
    },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
    { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/favicon/apple-touch-icon.png',
    },
    { rel: 'manifest', href: '/favicon/site.webmanifest' },
  ];

  for (const attributes of links) {
    const selector = attributes.rel === 'icon'
      ? `link[rel="icon"][type="${attributes.type}"]${attributes.sizes ? `[sizes="${attributes.sizes}"]` : ''}`
      : `link[rel="${attributes.rel}"]`;
    const link = document.head.querySelector(selector) || document.createElement('link');
    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }
    if (!link.parentNode) document.head.appendChild(link);
  }
})();
