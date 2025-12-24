export const NetworksTokensEmbed = () => {
    const resolveTheme = () => {
        if (typeof document === 'undefined') return 'dark';
        const html = document.documentElement;
        const attr = html.getAttribute('data-theme');
        if (attr === 'dark') return 'dark';
        if (attr === 'light') return 'light';
        return html.classList.contains('dark') ? 'dark' : 'light';
    };

    const API_ENDPOINT = 'https://api.layerswap.io/api/v2/networks';
    const DEFAULT_API_KEY = 'NDBxG+aon6WlbgIA2LfwmcbLU52qUL9qTnztTuTRPNSohf/VnxXpRaJlA5uLSQVqP8YGIiy/0mz+mMeZhLY4/Q';

    const getPalette = (theme) =>
        theme === 'dark'
            ? {
                background: 'linear-gradient(180deg, rgba(17, 20, 30, 0.9), rgba(17, 20, 30, 0.6))',
                borderColor: 'rgba(255,255,255,0.08)',
                textColor: '#f3f4f6',
                subTextColor: '#a1a1aa',
                highlight: 'rgba(204, 45, 93, 0.14)',
                cardBg: 'rgba(255,255,255,0.04)',
                cardHover: 'rgba(204, 45, 93, 0.2)',
                badgeBg: 'rgba(204, 45, 93, 0.12)',
                badgeColor: '#f9fafb',
                tableHeaderBg: 'rgba(255,255,255,0.04)',
                tableBorder: 'rgba(255,255,255,0.12)',
                divider: 'rgba(255,255,255,0.08)',
            }
            : {
                background: 'linear-gradient(180deg, rgba(226, 232, 240, 0.65), rgba(241, 245, 249, 0.95))',
                borderColor: 'rgba(15,23,42,0.08)',
                textColor: '#0f172a',
                subTextColor: '#475569',
                highlight: 'rgba(204, 45, 93, 0.12)',
                cardBg: '#ffffff',
                cardHover: 'rgba(204, 45, 93, 0.08)',
                badgeBg: 'rgba(204, 45, 93, 0.15)',
                badgeColor: '#c81d56',
                tableHeaderBg: 'rgba(241, 245, 249, 0.85)',
                tableBorder: 'rgba(15,23,42,0.12)',
                divider: 'rgba(15,23,42,0.08)',
            };

    const cardBaseClass = 'flex flex-col gap-2 rounded-xl border p-4 transition-all duration-200 cursor-pointer';

    const hasChainId = (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'number') return true;
        if (typeof value === 'string') return value.trim().length > 0;
        return false;
    };

    const parseChainIdString = (value) => {
        if (!hasChainId(value)) return null;
        return String(value).trim().toLowerCase();
    };

    const isDecimalNumber = (value) => {
        if (!hasChainId(value)) return false;
        const normalized = String(value).trim();
        if (/^0x/i.test(normalized)) return false;
        if (/[a-fA-F]/.test(normalized)) return false;
        const parsed = Number(normalized);
        return !Number.isNaN(parsed) && Number.isFinite(parsed);
    };


    const [theme, setTheme] = useState(resolveTheme);
    const [networks, setNetworks] = useState([]);
    const [tokensByNetwork, setTokensByNetwork] = useState({});
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState(null);
    const [viewMode, setViewMode] = useState('networks');
    const [selectedToken, setSelectedToken] = useState(null);
    const [networkDisplayStyle, setNetworkDisplayStyle] = useState('card');
    const [tokenSearchTerm, setTokenSearchTerm] = useState('');
    const palette = useMemo(() => getPalette(theme), [theme]);

    useEffect(() => {
        if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return undefined;
        const html = document.documentElement;
        const updateTheme = () => setTheme(resolveTheme());
        const observer = new MutationObserver(updateTheme);
        observer.observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setSelectedNetwork(null);
        setSelectedToken(null);
    }, [viewMode]);

    useEffect(() => {
        let cancelled = false;

        const loadNetworks = async () => {
            setIsLoading(true);
            setFetchError(null);

            try {
                const response = await fetch(API_ENDPOINT, {
                    headers: {
                        accept: 'application/json',
                        'X-LS-APIKEY': DEFAULT_API_KEY,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const payload = await response.json();
                if (cancelled) return;

                const { data = [], error: apiError } = payload || {};

                if (apiError && (apiError.message || apiError.code)) {
                    throw new Error(apiError.message || `API error: ${apiError.code}`);
                }

                if (!Array.isArray(data) || data.length === 0) {
                    setFetchError('API returned no networks.');
                    return;
                }

                const sortedNetworks = [...data].sort((a, b) => {
                    const nameA = (a.display_name || a.name || '').toLowerCase();
                    const nameB = (b.display_name || b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });

                const nextTokensMap = sortedNetworks.reduce((accumulator, network) => {
                    accumulator[network.name] = Array.isArray(network.tokens) ? network.tokens : [];
                    return accumulator;
                }, {});

                setNetworks(sortedNetworks);
                setTokensByNetwork(nextTokensMap);
                setSelectedNetwork(null);
            } catch (error) {
                if (cancelled) return;
                setFetchError(error instanceof Error ? error.message : 'Failed to load networks.');
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadNetworks();

        return () => {
            cancelled = true;
        };
    }, []);

    const availableTypes = useMemo(() => {
        const types = new Set();
        networks.forEach((network) => {
            if (network.type) {
                types.add(network.type.toLowerCase());
            }
        });
        return Array.from(types).sort();
    }, [networks]);

    const filteredNetworks = useMemo(() => {
        let filtered = networks;

        if (selectedTypeFilter) {
            filtered = filtered.filter((network) => (network.type || '').toLowerCase() === selectedTypeFilter);
        }

        const needle = searchTerm.trim().toLowerCase();
        if (needle) {
            filtered = filtered.filter((network) => {
                const display = (network.display_name || '').toLowerCase();
                const name = (network.name || '').toLowerCase();
                const type = (network.type || '').toLowerCase();
                return display.includes(needle) || name.includes(needle) || type.includes(needle);
            });
        }

        return filtered;
    }, [networks, searchTerm, selectedTypeFilter]);


    const tokens = useMemo(() => {
        const tokenList = selectedNetwork ? tokensByNetwork[selectedNetwork.name] || [] : [];
        return [...tokenList].sort((a, b) => {
            const symbolA = (a.symbol || '').toLowerCase();
            const symbolB = (b.symbol || '').toLowerCase();
            return symbolA.localeCompare(symbolB);
        });
    }, [selectedNetwork, tokensByNetwork]);

    const allTokens = useMemo(() => {
        const tokenMap = new Map();

        networks.forEach((network) => {
            const networkTokens = tokensByNetwork[network.name] || [];
            networkTokens.forEach((token) => {
                const symbol = token.symbol;
                if (!symbol) return;

                if (!tokenMap.has(symbol)) {
                    tokenMap.set(symbol, {
                        symbol,
                        display_asset: token.display_asset || token.symbol,
                        logo: token.logo,
                        networks: [],
                        networkCount: 0,
                    });
                }

                const tokenEntry = tokenMap.get(symbol);
                if (!tokenEntry.networks.find(n => n.name === network.name)) {
                    tokenEntry.networks.push(network);
                    tokenEntry.networkCount = tokenEntry.networks.length;
                }

                if (!tokenEntry.logo && token.logo) {
                    tokenEntry.logo = token.logo;
                }
                if (!tokenEntry.display_asset && token.display_asset) {
                    tokenEntry.display_asset = token.display_asset;
                }
            });
        });

        return Array.from(tokenMap.values()).sort((a, b) => {
            const symbolA = (a.symbol || '').toLowerCase();
            const symbolB = (b.symbol || '').toLowerCase();
            return symbolA.localeCompare(symbolB);
        });
    }, [networks, tokensByNetwork]);

    const filteredTokens = useMemo(() => {
        const needle = tokenSearchTerm.trim().toLowerCase();
        if (!needle) return allTokens;

        return allTokens.filter((token) => {
            const symbol = (token.symbol || '').toLowerCase();
            const displayAsset = (token.display_asset || '').toLowerCase();
            return symbol.includes(needle) || displayAsset.includes(needle);
        });
    }, [allTokens, tokenSearchTerm]);

    const errorBackground = theme === 'dark' ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.12)';
    const errorColor = theme === 'dark' ? '#fecaca' : '#b91c1c';

    const networksScrollStyle = {
        flex: '1',
        minHeight: 0,
        overflowY: 'hidden',
        overflowX: 'hidden',
        paddingTop: '0.25rem',
        boxSizing: 'border-box',
        width: '100%',
    };

    const tokensScrollStyle = {
        overflowX: 'auto',
        paddingBottom: '0.25rem',
        boxSizing: 'border-box',
        width: '100%',
    };

    return (
        <div
            className="flex flex-col gap-6 rounded-2xl border p-6 transition-colors duration-300 overflow-hidden"
            style={{
                borderColor: palette.borderColor,
                background: palette.background,
                color: palette.textColor,
            }}
        >

            {fetchError && (
                <div
                    className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                        background: errorBackground,
                        color: errorColor,
                    }}
                >
                    {fetchError}
                </div>
            )}

            {viewMode === 'networks' ? (
                selectedNetwork ? (
                    <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedNetwork(null)}
                                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                                    style={{
                                        background: palette.cardBg,
                                        borderColor: palette.borderColor,
                                        color: palette.textColor,
                                    }}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.background = palette.cardHover;
                                        event.currentTarget.style.borderColor = 'rgba(204, 45, 93, 0.3)';
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.background = palette.cardBg;
                                        event.currentTarget.style.borderColor = palette.borderColor;
                                    }}
                                >
                                    ← Back
                                </button>
                                <div className="flex flex-col gap-1">
                                    <span className="text-base font-semibold" style={{ color: palette.textColor }}>
                                        {selectedNetwork.display_name || selectedNetwork.name}
                                    </span>
                                    <span className="text-sm" style={{ color: palette.subTextColor }}>Supported Tokens</span>
                                </div>
                            </div>
                            <span className="text-sm" style={{ color: palette.subTextColor }}>
                                {tokens.length} token{tokens.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        <div
                            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl"
                            style={{
                                border: `1px solid ${palette.tableBorder}`,
                                background: palette.cardBg,
                            }}
                        >
                            {isLoading ? (
                                <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>Loading tokens…</div>
                            ) : tokens.length === 0 ? (
                                <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>
                                    No tokens available for this network yet.
                                </div>
                            ) : (
                                <div style={{ ...tokensScrollStyle, flex: '1', minHeight: 0, overflowY: 'auto' }}>
                                    <div className="flex min-w-min flex-col">
                                        <div
                                            className="sticky top-0 z-10 grid gap-4 px-4 py-3 text-sm font-semibold"
                                            style={{
                                                gridTemplateColumns: '180px 100px minmax(200px, 1fr) 80px 120px',
                                                background: palette.tableHeaderBg,
                                                borderBottom: `1px solid ${palette.divider}`,
                                                color: palette.textColor,
                                            }}
                                        >
                                            <div>Token</div>
                                            <div>Symbol</div>
                                            <div>Contract</div>
                                            <div>Decimals</div>
                                            <div className="text-right">Price (USD)</div>
                                        </div>
                                        {tokens.map((token, index) => {
                                            const tokenLogo = token.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                            const formattedPrice = typeof token.price_in_usd === 'number'
                                                ? `$${token.price_in_usd.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`
                                                : '—';

                                            return (
                                                <div
                                                    key={`${token.symbol}-${token.contract || 'native'}`}
                                                    className="grid items-center gap-4 px-4 py-3 transition-colors"
                                                    style={{
                                                        gridTemplateColumns: '180px 100px minmax(200px, 1fr) 80px 120px',
                                                        borderBottom: `1px solid ${palette.divider}`,
                                                    }}
                                                    onMouseEnter={(event) => {
                                                        event.currentTarget.style.background = palette.cardHover;
                                                    }}
                                                    onMouseLeave={(event) => {
                                                        event.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <div
                                                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                                                            style={{
                                                                background: 'rgba(0,0,0,0.05)',
                                                                border: `1px solid ${palette.borderColor}`,
                                                            }}
                                                        >
                                                            <img
                                                                src={tokenLogo}
                                                                alt={`${token.display_asset || token.symbol} logo`}
                                                                className="h-5 w-5 object-contain"
                                                            />
                                                        </div>
                                                        <span className="truncate text-sm font-medium" style={{ color: palette.textColor }}>
                                                            {token.display_asset || token.symbol}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm" style={{ color: palette.textColor }}>{token.symbol}</div>
                                                    <div
                                                        className="break-all font-mono text-xs"
                                                        style={{
                                                            color: token.contract ? palette.textColor : palette.subTextColor,
                                                        }}
                                                    >
                                                        {token.contract || 'Native'}
                                                    </div>
                                                    <div className="text-sm" style={{ color: palette.textColor }}>{token.decimals}</div>
                                                    <div className="text-right text-sm font-medium" style={{ color: palette.textColor, fontVariantNumeric: 'tabular-nums' }}>
                                                        {formattedPrice}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('networks')}
                                    className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                    style={{
                                        border: viewMode === 'networks' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'networks' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'networks' ? palette.textColor : palette.subTextColor,
                                        fontWeight: viewMode === 'networks' ? 600 : 400,
                                    }}
                                >
                                    Networks
                                </button>
                                <button
                                    onClick={() => setViewMode('tokens')}
                                    className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                    style={{
                                        border: viewMode === 'tokens' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'tokens' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'tokens' ? palette.textColor : palette.subTextColor,
                                        fontWeight: viewMode === 'tokens' ? 600 : 400,
                                    }}
                                >
                                    Tokens
                                </button>
                            </div>
                            <span className="text-sm" style={{ color: palette.subTextColor }}>
                                Showing {filteredNetworks.length} of {networks.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search networks"
                                className="w-full min-w-[220px] rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                                style={{
                                    border: `1px solid ${palette.borderColor}`,
                                    background: palette.cardBg,
                                    color: palette.textColor,
                                }}
                                autoComplete="off"
                            />
                            {availableTypes.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold" style={{ color: palette.subTextColor }}>Type:</span>
                                    <button
                                        onClick={() => setSelectedTypeFilter(null)}
                                        className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                        style={{
                                            border: selectedTypeFilter === null ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                            background: selectedTypeFilter === null ? palette.highlight : palette.cardBg,
                                            color: selectedTypeFilter === null ? palette.textColor : palette.subTextColor,
                                            fontWeight: selectedTypeFilter === null ? 600 : 400,
                                        }}
                                    >
                                        All
                                    </button>
                                    {availableTypes.map((type) => {
                                        const isSelected = selectedTypeFilter === type;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedTypeFilter(isSelected ? null : type)}
                                                className="rounded-lg px-3 py-1.5 text-xs uppercase transition-all"
                                                style={{
                                                    border: isSelected ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                                    background: isSelected ? palette.highlight : palette.cardBg,
                                                    color: isSelected ? palette.textColor : palette.subTextColor,
                                                    fontWeight: isSelected ? 600 : 400,
                                                }}
                                            >
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {isLoading && networks.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>Loading networks…</div>
                        ) : networks.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>
                                No networks available.
                            </div>
                        ) : filteredNetworks.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>
                                No networks match your search.
                            </div>
                        ) : (
                            <div style={networksScrollStyle}>
                                <div
                                    className="grid gap-4"
                                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
                                >
                                    {filteredNetworks.map((network) => {
                                        const networkLogo = network.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const networkTypeLabel = (network.type || 'unknown').toUpperCase();
                                        return (
                                            <button
                                                key={network.name}
                                                onClick={() => setSelectedNetwork(network)}
                                                className={cardBaseClass}
                                                style={{
                                                    background: palette.cardBg,
                                                    borderColor: palette.borderColor,
                                                }}
                                                onMouseEnter={(event) => {
                                                    event.currentTarget.style.background = palette.cardHover;
                                                    event.currentTarget.style.borderColor = 'rgba(204, 45, 93, 0.3)';
                                                    event.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(event) => {
                                                    event.currentTarget.style.background = palette.cardBg;
                                                    event.currentTarget.style.borderColor = palette.borderColor;
                                                    event.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
                                                        style={{
                                                            border: `1px solid ${palette.borderColor}`,
                                                            background: 'rgba(0,0,0,0.05)',
                                                        }}
                                                    >
                                                        <img
                                                            src={networkLogo}
                                                            alt={`${network.display_name || network.name} logo`}
                                                            className="h-7 w-7 object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-semibold" style={{ color: palette.textColor }}>{network.display_name || network.name}</span>
                                                        <span className="text-xs" style={{ color: palette.subTextColor }}>{network.name}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span
                                                        className="rounded-lg px-2 py-1 text-xs font-semibold"
                                                        style={{
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                        }}
                                                    >
                                                        {networkTypeLabel}
                                                    </span>
                                                    {isDecimalNumber(network.chain_id) && (
                                                        <span className="text-xs" style={{ color: palette.subTextColor }}>Chain ID: {network.chain_id}</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                )
            ) : (
                selectedToken ? (
                    <section className="flex min-h-0 flex-1 flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedToken(null)}
                                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                                    style={{
                                        background: palette.cardBg,
                                        borderColor: palette.borderColor,
                                        color: palette.textColor,
                                    }}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.background = palette.cardHover;
                                        event.currentTarget.style.borderColor = 'rgba(204, 45, 93, 0.3)';
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.background = palette.cardBg;
                                        event.currentTarget.style.borderColor = palette.borderColor;
                                    }}
                                >
                                    ← Back
                                </button>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
                                        style={{
                                            border: `1px solid ${palette.borderColor}`,
                                            background: 'rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        <img
                                            src={selectedToken.logo || 'https://cdn.layerswap.io/logos/layerswap.svg'}
                                            alt={`${selectedToken.display_asset || selectedToken.symbol} logo`}
                                            className="h-7 w-7 object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-base font-semibold" style={{ color: palette.textColor }}>
                                            {selectedToken.display_asset || selectedToken.symbol}
                                        </span>
                                        <span className="text-sm" style={{ color: palette.subTextColor }}>Supported Networks</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setNetworkDisplayStyle('card')}
                                        className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                        style={{
                                            border: networkDisplayStyle === 'card' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                            background: networkDisplayStyle === 'card' ? palette.highlight : palette.cardBg,
                                            color: networkDisplayStyle === 'card' ? palette.textColor : palette.subTextColor,
                                            fontWeight: networkDisplayStyle === 'card' ? 600 : 400,
                                        }}
                                    >
                                        Card
                                    </button>
                                    <button
                                        onClick={() => setNetworkDisplayStyle('list')}
                                        className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                        style={{
                                            border: networkDisplayStyle === 'list' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                            background: networkDisplayStyle === 'list' ? palette.highlight : palette.cardBg,
                                            color: networkDisplayStyle === 'list' ? palette.textColor : palette.subTextColor,
                                            fontWeight: networkDisplayStyle === 'list' ? 600 : 400,
                                        }}
                                    >
                                        List
                                    </button>
                                </div>
                                <span className="text-sm" style={{ color: palette.subTextColor }}>
                                    {selectedToken.networks.length} network{selectedToken.networks.length === 1 ? '' : 's'}
                                </span>
                            </div>
                        </div>

                        <div style={networksScrollStyle}>
                            {networkDisplayStyle === 'card' ? (
                                <div
                                    className="grid gap-4"
                                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
                                >
                                    {selectedToken.networks.map((network) => {
                                        const networkLogo = network.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const networkTypeLabel = (network.type || 'unknown').toUpperCase();
                                        return (
                                            <div
                                                key={network.name}
                                                className={cardBaseClass}
                                                style={{
                                                    background: palette.cardBg,
                                                    borderColor: palette.borderColor,
                                                }}
                                                onMouseEnter={(event) => {
                                                    event.currentTarget.style.background = palette.cardHover;
                                                    event.currentTarget.style.borderColor = 'rgba(204, 45, 93, 0.3)';
                                                    event.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(event) => {
                                                    event.currentTarget.style.background = palette.cardBg;
                                                    event.currentTarget.style.borderColor = palette.borderColor;
                                                    event.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
                                                        style={{
                                                            border: `1px solid ${palette.borderColor}`,
                                                            background: 'rgba(0,0,0,0.05)',
                                                        }}
                                                    >
                                                        <img
                                                            src={networkLogo}
                                                            alt={`${network.display_name || network.name} logo`}
                                                            className="h-7 w-7 object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-semibold" style={{ color: palette.textColor }}>{network.display_name || network.name}</span>
                                                        <span className="text-xs" style={{ color: palette.subTextColor }}>{network.name}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span
                                                        className="rounded-lg px-2 py-1 text-xs font-semibold"
                                                        style={{
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                        }}
                                                    >
                                                        {networkTypeLabel}
                                                    </span>
                                                    {isDecimalNumber(network.chain_id) && (
                                                        <span className="text-xs" style={{ color: palette.subTextColor }}>Chain ID: {network.chain_id}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div
                                    className="overflow-hidden rounded-2xl"
                                    style={{
                                        border: `1px solid ${palette.tableBorder}`,
                                        background: palette.cardBg,
                                    }}
                                >
                                    {selectedToken.networks.map((network, index) => {
                                        const networkLogo = network.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const networkTypeLabel = (network.type || 'unknown').toUpperCase();
                                        return (
                                            <div
                                                key={network.name}
                                                className="flex items-center gap-4 px-4 py-3 transition-colors"
                                                style={{
                                                    borderBottom: index < selectedToken.networks.length - 1 ? `1px solid ${palette.divider}` : 'none',
                                                }}
                                                onMouseEnter={(event) => {
                                                    event.currentTarget.style.background = palette.cardHover;
                                                }}
                                                onMouseLeave={(event) => {
                                                    event.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <div
                                                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                                                    style={{
                                                        border: `1px solid ${palette.borderColor}`,
                                                        background: 'rgba(0,0,0,0.05)',
                                                    }}
                                                >
                                                    <img
                                                        src={networkLogo}
                                                        alt={`${network.display_name || network.name} logo`}
                                                        className="h-6 w-6 object-contain"
                                                    />
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                    <span className="text-sm font-semibold" style={{ color: palette.textColor }}>
                                                        {network.display_name || network.name}
                                                    </span>
                                                    <span className="text-xs" style={{ color: palette.subTextColor }}>{network.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="rounded-lg px-2 py-1 text-xs font-semibold"
                                                        style={{
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                        }}
                                                    >
                                                        {networkTypeLabel}
                                                    </span>
                                                    {isDecimalNumber(network.chain_id) && (
                                                        <span className="text-xs" style={{ color: palette.subTextColor }}>Chain ID: {network.chain_id}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="flex min-h-0 flex-1 flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('networks')}
                                    className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                    style={{
                                        border: viewMode === 'networks' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'networks' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'networks' ? palette.textColor : palette.subTextColor,
                                        fontWeight: viewMode === 'networks' ? 600 : 400,
                                    }}
                                >
                                    Networks
                                </button>
                                <button
                                    onClick={() => setViewMode('tokens')}
                                    className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                    style={{
                                        border: viewMode === 'tokens' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'tokens' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'tokens' ? palette.textColor : palette.subTextColor,
                                        fontWeight: viewMode === 'tokens' ? 600 : 400,
                                    }}
                                >
                                    Tokens
                                </button>
                            </div>
                            <span className="text-sm" style={{ color: palette.subTextColor }}>
                                Showing {filteredTokens.length} of {allTokens.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <input
                                value={tokenSearchTerm}
                                onChange={(event) => setTokenSearchTerm(event.target.value)}
                                placeholder="Search tokens"
                                className="w-full min-w-[220px] rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                                style={{
                                    border: `1px solid ${palette.borderColor}`,
                                    background: palette.cardBg,
                                    color: palette.textColor,
                                }}
                                autoComplete="off"
                            />
                        </div>

                        {isLoading && allTokens.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>Loading tokens…</div>
                        ) : allTokens.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>
                                No tokens available.
                            </div>
                        ) : filteredTokens.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: palette.subTextColor }}>
                                No tokens match your search.
                            </div>
                        ) : (
                            <div style={networksScrollStyle}>
                                <div
                                    className="grid gap-4"
                                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
                                >
                                    {filteredTokens.map((token) => {
                                        const tokenLogo = token.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        return (
                                            <button
                                                key={token.symbol}
                                                onClick={() => setSelectedToken(token)}
                                                className={cardBaseClass}
                                                style={{
                                                    background: palette.cardBg,
                                                    borderColor: palette.borderColor,
                                                }}
                                                onMouseEnter={(event) => {
                                                    event.currentTarget.style.background = palette.cardHover;
                                                    event.currentTarget.style.borderColor = 'rgba(204, 45, 93, 0.3)';
                                                    event.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(event) => {
                                                    event.currentTarget.style.background = palette.cardBg;
                                                    event.currentTarget.style.borderColor = palette.borderColor;
                                                    event.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
                                                        style={{
                                                            border: `1px solid ${palette.borderColor}`,
                                                            background: 'rgba(0,0,0,0.05)',
                                                        }}
                                                    >
                                                        <img
                                                            src={tokenLogo}
                                                            alt={`${token.display_asset || token.symbol} logo`}
                                                            className="h-7 w-7 object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex flex-1 flex-col items-start gap-1">
                                                        <span className="font-semibold" style={{ color: palette.textColor }}>{token.display_asset || token.symbol}</span>
                                                        <span className="text-xs" style={{ color: palette.subTextColor }}>{token.symbol}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span
                                                        className="rounded-lg px-2 py-1 text-xs font-semibold"
                                                        style={{
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                        }}
                                                    >
                                                        {token.networkCount} network{token.networkCount === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                )
            )}
        </div>
    );
};

