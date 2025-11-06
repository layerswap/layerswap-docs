import { useState, useEffect, useRef } from 'react';

export const QuickstartEmbed = () => {
  const [packageManager, setPackageManager] = useState('npm');
  const [selectedWallets, setSelectedWallets] = useState(['EVM', 'Starknet', 'Solana', 'Bitcoin', 'Fuel', 'Ton', 'Tron', 'Paradex']);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Load Prism.js CSS and script from CDN with proper sequencing
  useEffect(() => {
    // Check if already loaded
    if (window.Prism) return;

    // Load Prism CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(link);

    // Add custom CSS to force word wrapping
    const style = document.createElement('style');
    style.textContent = `
      pre[class*="language-"] {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: anywhere !important;
        max-width: 100% !important;
        width: 100% !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        font-family: "JetBrains Mono", "JetBrains Mono Fallback", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
        font-size: 0.875rem !important;
        line-height: 1.5 !important;
      }
      code[class*="language-"],
      code[class*="language-"] * {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: anywhere !important;
        display: inline !important;
        max-width: 100% !important;
        font-family: "JetBrains Mono", "JetBrains Mono Fallback", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
      }
      code[class*="language-"] {
        display: block !important;
      }
      .token {
        word-break: normal !important;
        white-space: pre-wrap !important;
      }
    `;
    document.head.appendChild(style);

    // Load Prism core script first
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
    script.onload = () => {
      // After core loads, load language components
      const jsxScript = document.createElement('script');
      jsxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-jsx.min.js';
      jsxScript.onload = () => {
        // Load bash after JSX
        const bashScript = document.createElement('script');
        bashScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js';
        bashScript.onload = () => {
          // Trigger initial highlighting after all scripts loaded
          if (window.Prism) {
            window.Prism.highlightAll();
          }
        };
        document.head.appendChild(bashScript);
      };
      document.head.appendChild(jsxScript);
    };
    document.head.appendChild(script);
  }, []);

  const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm'];
  const WALLET_OPTIONS = ['EVM', 'Starknet', 'Solana', 'Bitcoin', 'Fuel', 'Ton', 'Tron', 'Paradex'];
  const providerImportMap = {
    EVM: { import: 'EVMProvider', from: '@layerswap/wallet-evm', install: '@layerswap/wallet-evm wagmi viem @tanstack/react-query' },
    Starknet: { import: 'StarknetProvider', from: '@layerswap/wallet-starknet' },
    Solana: { import: 'SVMProvider', from: '@layerswap/wallet-svm' },
    Bitcoin: { import: 'BitcoinProvider', from: '@layerswap/wallet-bitcoin', install: '@layerswap/wallet-bitcoin @bigmi/client @bigmi/core @bigmi/react' },
    Fuel: { import: 'FuelProvider', from: '@layerswap/wallet-fuel' },
    Ton:  { import: 'TonProvider', from: '@layerswap/wallet-ton' },
    Tron: { import: 'TronProvider', from: '@layerswap/wallet-tron' },
    Paradex: { import: 'ParadexProvider', from: '@layerswap/wallet-paradex' }
  };

  // --- Build install command
  const stateManagementPkg = 'zustand';
  const installPrefix =
    packageManager === 'yarn' ? 'yarn add ' :
    packageManager === 'pnpm' ? 'pnpm add ' :
                                'npm install ';
  const basePkgs = '@layerswap/widget';

  const selectedWalletPkgs = selectedWallets
    .map(w => providerImportMap[w]?.install || providerImportMap[w].from)
    .join(' ');
  const installCommand = `${installPrefix}${basePkgs} ${stateManagementPkg} ${selectedWalletPkgs}`;

  // --- Build starter snippet
  const importLines = ["import { LayerswapProvider, Swap } from '@layerswap/widget';"];
  selectedWallets.forEach((w) => {
    const cfg = providerImportMap[w];
    if (cfg) importLines.push(`import { ${cfg.import} } from '${cfg.from}';`);
  });
  const providersList = selectedWallets
    .map((w) => providerImportMap[w]?.import)
    .filter(Boolean)
    .map((provider, index, array) => {
      const indent = '        ';
      const isLast = index === array.length - 1;
      return `${indent}${provider}${isLast ? '' : ','}`;
    })
    .join('\n');
  
  const walletProvidersLine = selectedWallets.length > 0
    ? `      walletProviders={[\n${providersList}\n      ]}`
    : null;
  
  const snippetLines = [
    "import '@layerswap/widget/index.css';",
    ...importLines,
    "",
    "export default function App() {",
    "  return (",
    "    <LayerswapProvider",
    "      config={{",
    "        apiKey: {YOUR_API_KEY},",
    "        version: 'mainnet', //'mainnet' or 'testnet'",
    "        initialSettings: {",
    "           defaultTab: 'swap', //'swap' or 'cex'",    
    "           to: 'IMMUTABLEZK_MAINNET',",    
    "           toAsset: 'USDC'",    
    "        }",    
    "      }}",
    ...(walletProvidersLine ? [walletProvidersLine] : []),
    "    >",
    "      <Swap />",
    "    </LayerswapProvider>",
    "  );",
    "}"
  ];
  const starterSnippet = snippetLines.join('\n');

  // Refs for code blocks
  const installCodeRef = useRef(null);
  const snippetCodeRef = useRef(null);

  // Trigger Prism highlighting when code content changes
  useEffect(() => {
    const highlight = () => {
      if (window.Prism) {
        // Use highlightAllUnder for specific elements
        if (installCodeRef.current) {
          window.Prism.highlightElement(installCodeRef.current);
        }
        if (snippetCodeRef.current) {
          window.Prism.highlightElement(snippetCodeRef.current);
        }
      } else {
        // If Prism not loaded yet, try again
        setTimeout(highlight, 100);
      }
    };
    
    highlight();
  }, [installCommand, starterSnippet]);

  // --- Styles
  const chip = (active) => ({
    padding: '0.35rem 0.65rem',
    border: '1px solid rgba(255,255,255,0.12)',
    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    color: '#e5e7eb',
    borderRadius: 8,
    cursor: 'pointer'
  });
  const row = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' };
  const label = { color: '#a1a1aa', fontWeight: 600, marginRight: 8 };
  const preWrap = { position: 'relative' };
  const copyBtn = {
    position: 'absolute',
    top: 15,
    right: 8,
    padding: '0.25rem 0.5rem',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e5e7eb',
    cursor: 'pointer',
    fontSize: '0.75rem'
  };

  // --- Copy helpers
  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === 'install') {
        setCopiedInstall(true);
        setTimeout(() => setCopiedInstall(false), 1500);
      } else {
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 1500);
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
      newSelection = selectedWallets.filter(w => w !== key);

      // If deselecting EVM or Starknet, also remove Paradex since it depends on both
      if ((key === 'EVM' || key === 'Starknet') && selectedWallets.includes('Paradex')) {
        newSelection = newSelection.filter(w => w !== 'Paradex');
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
        border: '1px solid rgba(255,255,255,0.08)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
        borderRadius: 16,
        padding: '1rem',
        color: '#e5e7eb',
        maxWidth: '100%',
        overflow: 'hidden'
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
        {WALLET_OPTIONS.map((w) => {
          const isSelected = selectedWallets.includes(w);
          return (
            <button
              key={w}
              onClick={() => toggleWallet(w)}
              style={{
                padding: '0.35rem 0.65rem',
                border: isSelected ? '1px solid rgba(204, 45, 93, 0.5)' : '1px solid rgba(255,255,255,0.12)',
                background: isSelected ? 'rgba(204, 45, 93, 0.15)' : 'transparent',
                color: isSelected ? '#f2f2f2' : '#a1a1aa',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              {w}
            </button>
          );
        })}
      </div>

      {/* Install Command with Copy */}
      <div style={{ marginBottom: 12, maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ ...label, color: '#c7c7d1', marginBottom: 6 }}>Install</div>
        <div style={{ ...preWrap, maxWidth: '100%', overflow: 'hidden' }}>
          <pre style={{ background: 'rgba(0,0,0,0.35)', padding: 12, paddingRight: 50, borderRadius: 10, overflow: 'hidden', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            <code ref={installCodeRef} className="language-bash" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'anywhere', display: 'block', maxWidth: '100%' }}>{installCommand}</code>
          </pre>
          <button style={copyBtn} onClick={() => copy(installCommand, 'install')}>
            {copiedInstall ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Starter Snippet with Copy */}
      <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ ...label, color: '#c7c7d1', marginBottom: 6 }}>Initialize the SDK</div>
        <div style={{ ...preWrap, maxWidth: '100%', overflow: 'hidden' }}>
          <pre style={{ background: 'rgba(0,0,0,0.35)', padding: 12, borderRadius: 10, overflow: 'hidden', whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            <code ref={snippetCodeRef} className="language-jsx" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'anywhere', display: 'block', maxWidth: '100%' }}>{starterSnippet}</code>
          </pre>
          <button style={copyBtn} onClick={() => copy(starterSnippet, 'snippet')}>
            {copiedSnippet ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};