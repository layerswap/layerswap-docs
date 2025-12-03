import { useState, useEffect, useRef } from 'react';

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
          codeBg: 'rgba(15,23,42,0.9)',
          codeColor: '#f8fafc',
          copyBorder: '1px solid rgba(255,255,255,0.3)',
          copyBg: 'rgba(255,255,255,0.15)',
          copyColor: '#f8fafc',
        };

  const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm'];
  const WALLET_OPTIONS = ['EVM', 'Starknet', 'Solana', 'Bitcoin', 'Fuel', 'Ton', 'Tron', 'Paradex'];
  const providerImportMap = {
    EVM: {
      factory: 'createEVMProvider',
      configNeeded: true,
    },
    Starknet: {
      factory: 'createStarknetProvider',
      configNeeded: true,
    },
    Solana: {
      factory: 'createSVMProvider',
      configNeeded: true,
    },
    Bitcoin: {
      factory: 'createBitcoinProvider',
      configNeeded: false,
    },
    Fuel: {
      factory: 'createFuelProvider',
      configNeeded: false,
    },
    Ton: {
      factory: 'createTONProvider',
      configNeeded: true,
      configName: 'tonConfigs',
    },
    Tron: {
      factory: 'createTronProvider',
      configNeeded: false,
    },
    Paradex: {
      factory: 'createParadexProvider',
      configNeeded: false,
    },
  };

  // --- Build install command
  const installPrefix =
    packageManager === 'yarn'
      ? 'yarn add '
      : packageManager === 'pnpm'
      ? 'pnpm add '
      : 'npm install ';
  
  // Base packages always required
  const basePkgs = ['@layerswap/widget', '@layerswap/wallets'];
  
  // Wallet-specific additional dependencies mapping
  const walletDependencies = {
    EVM: ['wagmi', 'viem', '@tanstack/react-query'],
    Starknet: [],
    Solana: [],
    Bitcoin: ['@bigmi/client', '@bigmi/core', '@bigmi/react'],
    Fuel: [],
    Ton: [],
    Tron: [],
    Paradex: ['wagmi', 'viem', '@tanstack/react-query'], // Paradex requires EVM/Starknet which need these
  };
  
  // Collect all unique dependencies based on selected wallets
  const additionalDeps = new Set();
  
  selectedWallets.forEach((wallet) => {
    if (walletDependencies[wallet]) {
      walletDependencies[wallet].forEach((dep) => additionalDeps.add(dep));
    }
  });
  
  // Combine base packages with additional dependencies (base first, then additional)
  const installPkgs = [...basePkgs, ...Array.from(additionalDeps).sort()];
  const installCommand = `${installPrefix}${installPkgs.join(' ')}`;

  // Check if all providers are selected (for getDefaultProviders usage)
  const allProvidersSelected = WALLET_OPTIONS.every((wallet) => selectedWallets.includes(wallet));

  // --- Build starter snippet
  const importLines = ["import { LayerswapProvider, Swap } from '@layerswap/widget';"];

  // Determine imports based on selection
  if (allProvidersSelected) {
    // Use getDefaultProviders when all providers are selected
    importLines.push("import { getDefaultProviders } from '@layerswap/wallets';");
  } else if (selectedWallets.length > 0) {
    // Import individual factory functions
    const factories = selectedWallets
      .map((wallet) => providerImportMap[wallet]?.factory)
      .filter(Boolean);
    if (factories.length > 0) {
      importLines.push(`import { ${factories.join(', ')} } from '@layerswap/wallets';`);
    }
  }

  let walletProvidersCode = '';

  if (allProvidersSelected) {
    // Use getDefaultProviders for all providers
    walletProvidersCode = `  const walletProviders = getDefaultProviders({
    walletConnect: {
      projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
      name: "Your App Name",
      description: "Your app description",
      url: "https://yourapp.com",
      icons: ["https://yourapp.com/icon.png"]
    },
    ton: {
      tonApiKey: "YOUR_TON_API_KEY",
      manifestUrl: "https://yourapp.com/tonconnect-manifest.json"
    }
  })`;
  } else if (selectedWallets.length > 0) {
    // Build individual provider creations
    const needsWalletConnect = selectedWallets.some((w) =>
      ['EVM', 'Starknet', 'Solana'].includes(w)
    );
    const needsTonConfig = selectedWallets.includes('Ton');

    let configLines = [];

    if (needsWalletConnect) {
      configLines.push(`  const walletConnectConfigs = {
    projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
    name: "Your App Name",
    description: "Your app description",
    url: "https://yourapp.com",
    icons: ["https://yourapp.com/icon.png"]
  }`);
    }

    if (needsTonConfig) {
      configLines.push(`  const tonConfigs = {
    tonApiKey: "YOUR_TON_API_KEY",
    manifestUrl: "https://yourapp.com/tonconnect-manifest.json"
  }`);
    }

    const providerCreations = selectedWallets
      .map((wallet) => {
        const cfg = providerImportMap[wallet];
        if (!cfg) return null;

        if (cfg.configNeeded) {
          if (wallet === 'Ton') {
            return `    ${cfg.factory}({ tonConfigs })`;
          }
          return `    ${cfg.factory}({ walletConnectConfigs })`;
        }
        return `    ${cfg.factory}()`;
      })
      .filter(Boolean)
      .join(',\n');

    if (configLines.length > 0) {
      walletProvidersCode = configLines.join('\n\n') + '\n\n';
    }

    walletProvidersCode += `  const walletProviders = [\n${providerCreations}\n  ]`;
  }

  const snippetLines = [
    "import '@layerswap/widget/index.css';",
    ...importLines,
    "",
    "export default function App() {",
    ...(walletProvidersCode ? walletProvidersCode.split('\n') : []),
    ...(walletProvidersCode ? [''] : []),
    "  return (",
    "    <LayerswapProvider",
    "      config={{",
    "        apiKey: {YOUR_API_KEY},",
    "        version: 'mainnet', //'mainnet' or 'testnet'",
    "        initialValues: {",
    "           defaultTab: 'swap', //'swap' or 'cex'",
    "           to: 'IMMUTABLEZK_MAINNET',",
    "           toAsset: 'USDC'",
    "        }",
    "      }}",
    ...(selectedWallets.length > 0 ? ["      walletProviders={walletProviders}"] : []),
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
    top: 15,
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
      <div style={{ marginBottom: 12, maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ ...label, color: palette.sectionLabelColor, marginBottom: 6 }}>Install</div>
        <div style={{ ...preWrap, maxWidth: '100%', overflow: 'hidden' }}>
          <pre style={{
            background: palette.codeBg,
            padding: 12,
            paddingRight: 50,
            borderRadius: 10,
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
            color: palette.codeColor
          }}>
            <code ref={installCodeRef} className="language-bash" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'anywhere', display: 'block', maxWidth: '100%' }}>{installCommand}</code>
          </pre>
          <button style={copyBtn} onClick={() => copy(installCommand, 'install')}>
            {copiedInstall ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Starter Snippet with Copy */}
      <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ ...label, color: palette.sectionLabelColor, marginBottom: 6 }}>Initialize the SDK</div>
        <div style={{ ...preWrap, maxWidth: '100%', overflow: 'hidden' }}>
          <pre style={{
            background: palette.codeBg,
            padding: 12,
            borderRadius: 10,
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
            color: palette.codeColor
          }}>
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
