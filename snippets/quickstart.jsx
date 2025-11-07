const { useState, useEffect } = React;

export const QuickstartEmbed = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof document === 'undefined') return 'dark';
    const html = document.documentElement;
    const attr = html.getAttribute('data-theme');
    if (attr === 'dark') return 'dark';
    if (attr === 'light') return 'light';
    return html.classList.contains('dark') ? 'dark' : 'light';
  });
  const [packageManager, setPackageManager] = useState('npm');
  const [selectedWallets, setSelectedWallets] = useState([
    'EVM',
    'Starknet',
    'Solana',
    'Bitcoin',
    'Fuel',
    'Ton',
    'Tron',
    'Paradex',
  ]);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return undefined;
    const html = document.documentElement;
    const resolveTheme = () => {
      const attr = html.getAttribute('data-theme');
      if (attr === 'dark') return 'dark';
      if (attr === 'light') return 'light';
      return html.classList.contains('dark') ? 'dark' : 'light';
    };

    const updateTheme = () => setTheme(resolveTheme());
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => observer.disconnect();
  }, []);

  const palette =
    theme === 'dark'
      ? {
          containerBorder: '1px solid rgba(255,255,255,0.08)',
          containerBg: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          textColor: '#e5e7eb',
          labelColor: '#a1a1aa',
          sectionLabelColor: '#c7c7d1',
          chipBorder: '1px solid rgba(255,255,255,0.12)',
          chipBorderActive: '1px solid rgba(255,255,255,0.18)',
          chipBg: 'transparent',
          chipBgActive: 'rgba(255,255,255,0.12)',
          chipColor: '#e5e7eb',
          chipColorActive: '#f9fafb',
          walletBorder: '1px solid rgba(255,255,255,0.12)',
          walletBorderActive: '1px solid rgba(204, 45, 93, 0.5)',
          walletBg: 'transparent',
          walletBgActive: 'rgba(204, 45, 93, 0.15)',
          walletColor: '#a1a1aa',
          walletColorActive: '#f2f2f2',
          codeBg: 'rgba(0,0,0,0.35)',
          codeColor: '#f9fafb',
          copyBorder: '1px solid rgba(255,255,255,0.14)',
          copyBg: 'rgba(255,255,255,0.06)',
          copyColor: '#e5e7eb',
        }
      : {
          containerBorder: '1px solid rgba(15,23,42,0.08)',
          containerBg: 'linear-gradient(180deg, rgba(148,163,184,0.08), rgba(226,232,240,0.38))',
          textColor: '#0f172a',
          labelColor: '#475569',
          sectionLabelColor: '#334155',
          chipBorder: '1px solid rgba(148,163,184,0.45)',
          chipBorderActive: '1px solid rgba(204, 45, 93, 0.45)',
          chipBg: 'rgba(241,245,249,0.6)',
          chipBgActive: 'rgba(204,45,93,0.12)',
          chipColor: '#475569',
          chipColorActive: '#c81d56',
          walletBorder: '1px solid rgba(148,163,184,0.45)',
          walletBorderActive: '1px solid rgba(204, 45, 93, 0.45)',
          walletBg: 'rgba(248,250,252,0.8)',
          walletBgActive: 'rgba(204,45,93,0.14)',
          walletColor: '#475569',
          walletColorActive: '#c81d56',
          codeBg: 'rgba(15,23,42,0.08)',
          codeColor: '#0f172a',
          copyBorder: '1px solid rgba(148,163,184,0.35)',
          copyBg: 'rgba(148,163,184,0.18)',
          copyColor: '#0f172a',
        };

  const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm'];
  const WALLET_OPTIONS = ['EVM', 'Starknet', 'Solana', 'Bitcoin', 'Fuel', 'Ton', 'Paradex'];
  const providerImportMap = {
    EVM: {
      import: 'EVMProvider',
      from: '@layerswap/wallet-evm',
      install: '@layerswap/wallet-evm wagmi viem @tanstack/react-query',
    },
    Starknet: { import: 'StarknetProvider', from: '@layerswap/wallet-starknet' },
    Solana: { import: 'SVMProvider', from: '@layerswap/wallet-svm' },
    Bitcoin: {
      import: 'BitcoinProvider',
      from: '@layerswap/wallet-bitcoin',
      install: '@layerswap/wallet-bitcoin @bigmi/client @bigmi/core @bigmi/react',
    },
    Fuel: { import: 'FuelProvider', from: '@layerswap/wallet-fuel' },
    Ton: { import: 'TonProvider', from: '@layerswap/wallet-ton' },
    Tron: { import: 'TronProvider', from: '@layerswap/wallet-tron' },
    Paradex: { import: 'ParadexProvider', from: '@layerswap/wallet-paradex' },
  };

  // --- Build install command
  const stateManagementPkg = 'zustand';
  const installPrefix =
    packageManager === 'yarn'
      ? 'yarn add '
      : packageManager === 'pnpm'
      ? 'pnpm add '
      : 'npm install ';
  const basePkgs = '@layerswap/widget';

  const selectedWalletPkgs = selectedWallets
    .map((wallet) => providerImportMap[wallet]?.install || providerImportMap[wallet]?.from)
    .join(' ');
  const installCommand = `${installPrefix}${basePkgs} ${stateManagementPkg} ${selectedWalletPkgs}`;

  // --- Build starter snippet
  const importLines = ["import { LayerswapProvider, Swap } from '@layerswap/widget';"];
  selectedWallets.forEach((wallet) => {
    const cfg = providerImportMap[wallet];
    if (cfg) importLines.push(`import { ${cfg.import} } from '${cfg.from}';`);
  });
  const providersArray = selectedWallets
    .map((wallet) => providerImportMap[wallet]?.import)
    .filter(Boolean)
    .join(', ');
  const snippetLines = [
    "import '@layerswap/widget/index.css';",
    ...importLines,
    '',
    'export default function App() {',
    '  return (',
    '    <LayerswapProvider',
    '      config={{',
    '        apiKey: {YOUR_API_KEY},',
    "        version: 'mainnet' ,//'mainnet' or 'testnet'",
    '        initialSettings: {',
    "           defaultTab: 'swap' //'swap' or 'cex'",
    "           to: 'IMMUTABLEZK_MAINNET',",
    "           toAsset: 'USDC',",
    "           destination_address: '0x1234567890abcdef1234567890abcdef12345678'",
    '        }',
    '      }}',
    `      walletProviders={[${providersArray}]}`,
    '    >',
    '      <Swap />',
    '    </LayerswapProvider>',
    '  );',
    '}',
  ];
  const starterSnippet = snippetLines.join('\n');

  // --- Styles
  const chip = (active) => ({
    padding: '0.35rem 0.65rem',
    border: active ? palette.chipBorderActive : palette.chipBorder,
    background: active ? palette.chipBgActive : palette.chipBg,
    color: active ? palette.chipColorActive : palette.chipColor,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });
  const row = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' };
  const label = { color: palette.labelColor, fontWeight: 600, marginRight: 8 };
  const preWrap = { position: 'relative' };
  const copyBtn = {
    position: 'absolute',
    top: -50,
    right: 8,
    padding: '0.25rem 0.5rem',
    borderRadius: 8,
    border: palette.copyBorder,
    background: palette.copyBg,
    color: palette.copyColor,
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s ease',
  };

  // --- Copy helpers
  const copy = async (text, which) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        if (which === 'install') {
          setCopiedInstall(true);
          setTimeout(() => setCopiedInstall(false), 1500);
        } else {
          setCopiedSnippet(true);
          setTimeout(() => setCopiedSnippet(false), 1500);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // --- Wallet selection logic
  // Paradex requires both EVM and Starknet as dependencies
  const toggleWallet = (key) => {
    const has = selectedWallets.includes(key);
    let newSelection;

    if (has) {
      // Deselecting a wallet
      newSelection = selectedWallets.filter((wallet) => wallet !== key);

      // If deselecting EVM or Starknet, also remove Paradex since it depends on both
      if ((key === 'EVM' || key === 'Starknet') && selectedWallets.includes('Paradex')) {
        newSelection = newSelection.filter((wallet) => wallet !== 'Paradex');
      }
    } else {
      // Selecting a wallet
      newSelection = [...selectedWallets, key];

      // If selecting Paradex, auto-include its dependencies (EVM and Starknet)
      if (key === 'Paradex') {
        const withDeps = new Set(newSelection.concat(['EVM', 'Starknet']));
        newSelection = Array.from(withDeps);
      }
    }

    setSelectedWallets(newSelection);
  };

  return (
    <div
      style={{
        border: palette.containerBorder,
        background: palette.containerBg,
        borderRadius: 16,
        padding: '1rem',
        color: palette.textColor,
        transition: 'background 0.3s ease, color 0.3s ease, border 0.3s ease',
      }}
    >
      {/* Package Manager */}
      <div style={{ ...row, marginBottom: 12 }}>
        <span style={label}>Package manager:</span>
        {PACKAGE_MANAGERS.map((pm) => (
          <button key={pm} style={chip(packageManager === pm)} onClick={() => setPackageManager(pm)}>
            {pm}
          </button>
        ))}
      </div>

      {/* Wallet Providers (multiselect) */}
      <div style={{ ...row, marginBottom: 8 }}>
        <span style={label}>Wallet providers:</span>
        {WALLET_OPTIONS.map((wallet) => {
          const isSelected = selectedWallets.includes(wallet);
          return (
            <button
              key={wallet}
              onClick={() => toggleWallet(wallet)}
              style={{
                padding: '0.35rem 0.65rem',
                border: isSelected ? palette.walletBorderActive : palette.walletBorder,
                background: isSelected ? palette.walletBgActive : palette.walletBg,
                color: isSelected ? palette.walletColorActive : palette.walletColor,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              {wallet}
            </button>
          );
        })}
      </div>

      {/* Install Command with Copy */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ ...label, color: palette.sectionLabelColor, marginBottom: 6 }}>Install</div>
        <div style={preWrap}>
          <pre
            style={{
              background: palette.codeBg,
              padding: 12,
              paddingRight: 50,
              borderRadius: 10,
              overflowX: 'auto',
              color: palette.codeColor,
            }}
          >
            <code>{installCommand}</code>
          </pre>
          <button style={copyBtn} onClick={() => copy(installCommand, 'install')}>
            {copiedInstall ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Starter Snippet with Copy */}
      <div>
        <div style={{ ...label, color: palette.sectionLabelColor, marginBottom: 6 }}>Initialize the SDK</div>
        <div style={preWrap}>
          <pre
            style={{
              background: palette.codeBg,
              padding: 12,
              borderRadius: 10,
              overflowX: 'auto',
              color: palette.codeColor,
            }}
          >
            <code>{starterSnippet}</code>
          </pre>
          <button style={copyBtn} onClick={() => copy(starterSnippet, 'snippet')}>
            {copiedSnippet ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
