import { useEffect, useMemo, useState } from 'react';

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

    const cardBaseStyle = {
        borderRadius: 14,
        padding: '1rem',
        transition: 'transform 0.2s ease, background 0.2s ease, border 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        border: '1px solid transparent',
    };

    const hasChainId = (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'number') return true;
        if (typeof value === 'string') return value.trim().length > 0;
        return false;
    };

    const parseChainIdNumber = (value) => {
        if (!hasChainId(value)) return null;
        const normalized = String(value).trim();
        if (/^0x/i.test(normalized)) {
            const parsed = Number.parseInt(normalized, 16);
            return Number.isNaN(parsed) ? null : parsed;
        }
        const parsed = Number(normalized);
        return Number.isNaN(parsed) ? null : parsed;
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

    const compareChainIds = (a, b) => {
        const aHas = hasChainId(a.chain_id);
        const bHas = hasChainId(b.chain_id);

        if (!aHas && !bHas) {
            return (a.display_name || a.name || '').localeCompare(b.display_name || b.name || '');
        }

        if (!aHas) return 1;
        if (!bHas) return -1;

        const aNum = parseChainIdNumber(a.chain_id);
        const bNum = parseChainIdNumber(b.chain_id);

        if (aNum !== null && bNum !== null && aNum !== bNum) {
            return aNum - bNum;
        }

        if (aNum !== null && bNum === null) return -1;
        if (aNum === null && bNum !== null) return 1;

        const aStr = parseChainIdString(a.chain_id) || '';
        const bStr = parseChainIdString(b.chain_id) || '';
        const strCompare = aStr.localeCompare(bStr);
        if (strCompare !== 0) return strCompare;

        return (a.display_name || a.name || '').localeCompare(b.display_name || b.name || '');
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
            style={{
                borderRadius: 16,
                border: `1px solid ${palette.borderColor}`,
                background: palette.background,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                color: palette.textColor,
                transition: 'background 0.3s ease, color 0.3s ease, border 0.3s ease',
                overflow: 'hidden',
                overflowY: 'hidden',
            }}
        >

            {fetchError && (
                <div
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 12,
                        background: errorBackground,
                        color: errorColor,
                        fontSize: '0.85rem',
                        fontWeight: 500,
                    }}
                >
                    {fetchError}
                </div>
            )}

            {viewMode === 'networks' ? (
                selectedNetwork ? (
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1', minHeight: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setSelectedNetwork(null)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: 8,
                                        border: `1px solid ${palette.borderColor}`,
                                        background: palette.cardBg,
                                        color: palette.textColor,
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '1rem', color: palette.textColor }}>
                                        {selectedNetwork.display_name || selectedNetwork.name}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: palette.subTextColor }}>Supported Tokens</span>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: palette.subTextColor }}>
                                {tokens.length} token{tokens.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        <div
                            style={{
                                borderRadius: 16,
                                border: `1px solid ${palette.tableBorder}`,
                                overflow: 'hidden',
                                background: palette.cardBg,
                                display: 'flex',
                                flexDirection: 'column',
                                flex: '1',
                                minHeight: 0,
                            }}
                        >
                            {isLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>Loading tokens…</div>
                            ) : tokens.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>
                                    No tokens available for this network yet.
                                </div>
                            ) : (
                                <div style={{ ...tokensScrollStyle, flex: '1', minHeight: 0, overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 'min-content' }}>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '180px 100px minmax(200px, 1fr) 80px 120px',
                                                gap: '1rem',
                                                padding: '0.75rem 1rem',
                                                background: palette.tableHeaderBg,
                                                borderBottom: `1px solid ${palette.divider}`,
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 1,
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: palette.textColor }}>Token</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: palette.textColor }}>Symbol</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: palette.textColor }}>Contract</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: palette.textColor }}>Decimals</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: palette.textColor, textAlign: 'right' }}>Price (USD)</div>
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
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '180px 100px minmax(200px, 1fr) 80px 120px',
                                                        gap: '1rem',
                                                        padding: '0.75rem 1rem',
                                                        borderBottom: `1px solid ${palette.divider}`,
                                                        alignItems: 'center',
                                                        transition: 'background 0.15s ease',
                                                    }}
                                                    onMouseEnter={(event) => {
                                                        event.currentTarget.style.background = palette.cardHover;
                                                    }}
                                                    onMouseLeave={(event) => {
                                                        event.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                                        <div
                                                            style={{
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: '50%',
                                                                background: 'rgba(0,0,0,0.05)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: `1px solid ${palette.borderColor}`,
                                                                overflow: 'hidden',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <img
                                                                src={tokenLogo}
                                                                alt={`${token.display_asset || token.symbol} logo`}
                                                                style={{ width: 20, height: 20, objectFit: 'contain' }}
                                                            />
                                                        </div>
                                                        <span style={{ fontWeight: 500, color: palette.textColor, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {token.display_asset || token.symbol}
                                                        </span>
                                                    </div>
                                                    <div style={{ color: palette.textColor, fontSize: '0.9rem' }}>{token.symbol}</div>
                                                    <div
                                                        style={{
                                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                                            fontSize: '0.85rem',
                                                            color: token.contract ? palette.textColor : palette.subTextColor,
                                                            wordBreak: 'break-all',
                                                            overflowWrap: 'break-word',
                                                        }}
                                                    >
                                                        {token.contract || 'Native'}
                                                    </div>
                                                    <div style={{ color: palette.textColor, fontSize: '0.9rem' }}>{token.decimals}</div>
                                                    <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: palette.textColor, fontSize: '0.9rem', fontWeight: 500 }}>
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
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1', minHeight: 0, overflowY: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setViewMode('networks')}
                                    style={{
                                        padding: '0.35rem 0.65rem',
                                        borderRadius: 8,
                                        border: viewMode === 'networks' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'networks' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'networks' ? palette.textColor : palette.subTextColor,
                                        fontSize: '0.8rem',
                                        fontWeight: viewMode === 'networks' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Networks
                                </button>
                                <button
                                    onClick={() => setViewMode('tokens')}
                                    style={{
                                        padding: '0.35rem 0.65rem',
                                        borderRadius: 8,
                                        border: viewMode === 'tokens' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'tokens' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'tokens' ? palette.textColor : palette.subTextColor,
                                        fontSize: '0.8rem',
                                        fontWeight: viewMode === 'tokens' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Tokens
                                </button>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: palette.subTextColor }}>
                                Showing {filteredNetworks.length} of {networks.length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search networks"
                                style={{
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: 10,
                                    border: `1px solid ${palette.borderColor}`,
                                    background: palette.cardBg,
                                    color: palette.textColor,
                                    minWidth: 220,
                                    width: '100%'
                                }}
                                autoComplete="off"
                            />
                            {availableTypes.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: palette.subTextColor, fontWeight: 600, marginRight: '0.25rem' }}>Type:</span>
                                    <button
                                        onClick={() => setSelectedTypeFilter(null)}
                                        style={{
                                            padding: '0.35rem 0.65rem',
                                            borderRadius: 8,
                                            border: selectedTypeFilter === null ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                            background: selectedTypeFilter === null ? palette.highlight : palette.cardBg,
                                            color: selectedTypeFilter === null ? palette.textColor : palette.subTextColor,
                                            fontSize: '0.8rem',
                                            fontWeight: selectedTypeFilter === null ? 600 : 400,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
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
                                                style={{
                                                    padding: '0.35rem 0.65rem',
                                                    borderRadius: 8,
                                                    border: isSelected ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                                    background: isSelected ? palette.highlight : palette.cardBg,
                                                    color: isSelected ? palette.textColor : palette.subTextColor,
                                                    fontSize: '0.8rem',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    textTransform: 'uppercase',
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
                            <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>Loading networks…</div>
                        ) : networks.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>
                                No networks available.
                            </div>
                        ) : filteredNetworks.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>
                                No networks match your search.
                            </div>
                        ) : (
                            <div style={networksScrollStyle}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                    {filteredNetworks.map((network) => {
                                        const networkLogo = network.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const networkTypeLabel = (network.type || 'unknown').toUpperCase();
                                        return (
                                            <button
                                                key={network.name}
                                                onClick={() => setSelectedNetwork(network)}
                                                style={{
                                                    ...cardBaseStyle,
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div
                                                        style={{
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: '50%',
                                                            border: `1px solid ${palette.borderColor}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(0,0,0,0.05)',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <img
                                                            src={networkLogo}
                                                            alt={`${network.display_name || network.name} logo`}
                                                            style={{ width: 28, height: 28, objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                                                        <span style={{ fontWeight: 600, color: palette.textColor }}>{network.display_name || network.name}</span>
                                                        <span style={{ fontSize: '0.8rem', color: palette.subTextColor }}>{network.name}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    <span
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: 8,
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {networkTypeLabel}
                                                    </span>
                                                    {isDecimalNumber(network.chain_id) && (
                                                        <span style={{ fontSize: '0.75rem', color: palette.subTextColor }}>Chain ID: {network.chain_id}</span>
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
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setSelectedToken(null)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: 8,
                                        border: `1px solid ${palette.borderColor}`,
                                        background: palette.cardBg,
                                        color: palette.textColor,
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: '50%',
                                            border: `1px solid ${palette.borderColor}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(0,0,0,0.05)',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <img
                                            src={selectedToken.logo || 'https://cdn.layerswap.io/logos/layerswap.svg'}
                                            alt={`${selectedToken.display_asset || selectedToken.symbol} logo`}
                                            style={{ width: 28, height: 28, objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1rem', color: palette.textColor }}>
                                            {selectedToken.display_asset || selectedToken.symbol}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: palette.subTextColor }}>Supported Networks</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setNetworkDisplayStyle('card')}
                                        style={{
                                            padding: '0.35rem 0.65rem',
                                            borderRadius: 8,
                                            border: networkDisplayStyle === 'card' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                            background: networkDisplayStyle === 'card' ? palette.highlight : palette.cardBg,
                                            color: networkDisplayStyle === 'card' ? palette.textColor : palette.subTextColor,
                                            fontSize: '0.8rem',
                                            fontWeight: networkDisplayStyle === 'card' ? 600 : 400,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        Card
                                    </button>
                                    <button
                                        onClick={() => setNetworkDisplayStyle('list')}
                                        style={{
                                            padding: '0.35rem 0.65rem',
                                            borderRadius: 8,
                                            border: networkDisplayStyle === 'list' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                            background: networkDisplayStyle === 'list' ? palette.highlight : palette.cardBg,
                                            color: networkDisplayStyle === 'list' ? palette.textColor : palette.subTextColor,
                                            fontSize: '0.8rem',
                                            fontWeight: networkDisplayStyle === 'list' ? 600 : 400,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        List
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: palette.subTextColor }}>
                                    {selectedToken.networks.length} network{selectedToken.networks.length === 1 ? '' : 's'}
                                </span>
                            </div>
                        </div>

                        <div style={networksScrollStyle}>
                            {networkDisplayStyle === 'card' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                    {selectedToken.networks.map((network) => {
                                        const networkLogo = network.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const networkTypeLabel = (network.type || 'unknown').toUpperCase();
                                        return (
                                            <div
                                                key={network.name}
                                                style={{
                                                    ...cardBaseStyle,
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div
                                                        style={{
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: '50%',
                                                            border: `1px solid ${palette.borderColor}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(0,0,0,0.05)',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <img
                                                            src={networkLogo}
                                                            alt={`${network.display_name || network.name} logo`}
                                                            style={{ width: 28, height: 28, objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                                                        <span style={{ fontWeight: 600, color: palette.textColor }}>{network.display_name || network.name}</span>
                                                        <span style={{ fontSize: '0.8rem', color: palette.subTextColor }}>{network.name}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    <span
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: 8,
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {networkTypeLabel}
                                                    </span>
                                                    {isDecimalNumber(network.chain_id) && (
                                                        <span style={{ fontSize: '0.75rem', color: palette.subTextColor }}>Chain ID: {network.chain_id}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        borderRadius: 16,
                                        border: `1px solid ${palette.tableBorder}`,
                                        overflow: 'hidden',
                                        background: palette.cardBg,
                                    }}
                                >
                                    {selectedToken.networks.map((network, index) => {
                                        const networkLogo = network.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const networkTypeLabel = (network.type || 'unknown').toUpperCase();
                                        return (
                                            <div
                                                key={network.name}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '0.75rem 1rem',
                                                    borderBottom: index < selectedToken.networks.length - 1 ? `1px solid ${palette.divider}` : 'none',
                                                    transition: 'background 0.15s ease',
                                                }}
                                                onMouseEnter={(event) => {
                                                    event.currentTarget.style.background = palette.cardHover;
                                                }}
                                                onMouseLeave={(event) => {
                                                    event.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        border: `1px solid ${palette.borderColor}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'rgba(0,0,0,0.05)',
                                                        overflow: 'hidden',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <img
                                                        src={networkLogo}
                                                        alt={`${network.display_name || network.name} logo`}
                                                        style={{ width: 24, height: 24, objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1', minWidth: 0 }}>
                                                    <span style={{ fontWeight: 600, color: palette.textColor, fontSize: '0.9rem' }}>
                                                        {network.display_name || network.name}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: palette.subTextColor }}>{network.name}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: 8,
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {networkTypeLabel}
                                                    </span>
                                                    {isDecimalNumber(network.chain_id) && (
                                                        <span style={{ fontSize: '0.75rem', color: palette.subTextColor }}>Chain ID: {network.chain_id}</span>
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
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setViewMode('networks')}
                                    style={{
                                        padding: '0.35rem 0.65rem',
                                        borderRadius: 8,
                                        border: viewMode === 'networks' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'networks' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'networks' ? palette.textColor : palette.subTextColor,
                                        fontSize: '0.8rem',
                                        fontWeight: viewMode === 'networks' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Networks
                                </button>
                                <button
                                    onClick={() => setViewMode('tokens')}
                                    style={{
                                        padding: '0.35rem 0.65rem',
                                        borderRadius: 8,
                                        border: viewMode === 'tokens' ? `1px solid rgba(204, 45, 93, 0.5)` : `1px solid ${palette.borderColor}`,
                                        background: viewMode === 'tokens' ? palette.highlight : palette.cardBg,
                                        color: viewMode === 'tokens' ? palette.textColor : palette.subTextColor,
                                        fontSize: '0.8rem',
                                        fontWeight: viewMode === 'tokens' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Tokens
                                </button>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: palette.subTextColor }}>
                                Showing {filteredTokens.length} of {allTokens.length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input
                                value={tokenSearchTerm}
                                onChange={(event) => setTokenSearchTerm(event.target.value)}
                                placeholder="Search tokens"
                                style={{
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: 10,
                                    border: `1px solid ${palette.borderColor}`,
                                    background: palette.cardBg,
                                    color: palette.textColor,
                                    minWidth: 220,
                                    width: '100%'
                                }}
                                autoComplete="off"
                            />
                        </div>

                        {isLoading && allTokens.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>Loading tokens…</div>
                        ) : allTokens.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>
                                No tokens available.
                            </div>
                        ) : filteredTokens.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: palette.subTextColor }}>
                                No tokens match your search.
                            </div>
                        ) : (
                            <div style={networksScrollStyle}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                    {filteredTokens.map((token) => {
                                        const tokenLogo = token.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        return (
                                            <button
                                                key={token.symbol}
                                                onClick={() => setSelectedToken(token)}
                                                style={{
                                                    ...cardBaseStyle,
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div
                                                        style={{
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: '50%',
                                                            border: `1px solid ${palette.borderColor}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(0,0,0,0.05)',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <img
                                                            src={tokenLogo}
                                                            alt={`${token.display_asset || token.symbol} logo`}
                                                            style={{ width: 28, height: 28, objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start', flex: '1' }}>
                                                        <span style={{ fontWeight: 600, color: palette.textColor }}>{token.display_asset || token.symbol}</span>
                                                        <span style={{ fontSize: '0.8rem', color: palette.subTextColor }}>{token.symbol}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    <span
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: 8,
                                                            background: palette.badgeBg,
                                                            color: palette.badgeColor,
                                                            fontWeight: 600,
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

