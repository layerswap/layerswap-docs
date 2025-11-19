'use client';

const ReactGlobal = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.React) return globalThis.React;
  if (typeof window !== 'undefined' && window.React) return window.React;
  return null;
})();

if (!ReactGlobal) {
  throw new Error('React is required for snippets/DepositWidget.jsx but was not found on the global scope.');
}

const { useMemo, useState, useEffect, useRef } = ReactGlobal;

const API_BASE = 'https://api.layerswap.io/api/v2';
const STATUS_POLL_INTERVAL_MS = 5000;
const TERMINAL_SWAP_STATUSES = ['completed', 'failed', 'cancelled'];
const STATUS_GUIDE = [
  { code: 'user_transfer_pending', description: 'Awaiting the user deposit on the selected source network.' },
  { code: 'ls_transfer_pending', description: 'Deposit received; Layerswap is preparing the destination transfer.' },
  { code: 'completed', description: 'Funds have been delivered to the destination wallet.' },
  { code: 'failed', description: 'Transfer was unable to complete. Contact support if this persists.' },
];

const formatAmount = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const number = Number(value);
  if (Math.abs(number) >= 1) return number.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return number.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
};

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return 'Instant';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
};

const toJsonString = (value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return `${value}`;
  }
};

const shortenHash = (hash) => {
  if (!hash || typeof hash !== 'string') return '';
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
};

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

const buildCurlCommand = ({ method, endpoint, body, apiKey }) => {
  const lines = [`curl --request ${method.toUpperCase()}`, `  --url ${API_BASE}${endpoint}`];
  if (apiKey) {
    lines.push(`  --header 'X-LS-APIKEY: ${apiKey}'`);
  }
  lines.push("  --header 'Content-Type: application/json'");
  if (body && Object.keys(body).length > 0 && method.toUpperCase() !== 'GET') {
    lines.push(`  --data '${JSON.stringify(body)}'`);
  }
  return lines.join(' \\\n');
};


export const DepositWidget = () => {
  const getEmptyQuoteState = () => ({
    routes: [],
    banner: null,
    loading: false,
  });

  const getEmptySwapState = () => ({
    swapId: '',
    depositAddress: '',
    depositNetwork: '',
    depositToken: '',
    banner: null,
    loading: false,
  });

  const [config, setConfig] = useState({ apiKey: '', walletAddress: '', destinationNetwork: 'Base', destinationToken: 'ETH', tokenMode: 'single' });
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedSourceToken, setSelectedSourceToken] = useState('');
  const [selectedDestinationToken, setSelectedDestinationToken] = useState('');
  const [sources, setSources] = useState([]);
  const [sourceBanner, setSourceBanner] = useState(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [destinationTokens, setDestinationTokens] = useState([]);
  const [destinationBanner, setDestinationBanner] = useState(null);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [quoteState, setQuoteState] = useState(getEmptyQuoteState);
  const [swapState, setSwapState] = useState(getEmptySwapState);
  const [apiActivity, setApiActivity] = useState([]);
  const [copyNotice, setCopyNotice] = useState('');
  const [statusSnapshot, setStatusSnapshot] = useState({
    status: '',
    source: null,
    destination: null,
    inputs: [],
    outputs: [],
    lastUpdated: null,
  });
  const [statusBanner, setStatusBanner] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(null);
  const [activeStep, setActiveStep] = useState('config');
  const copyTimeoutRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const configSectionRef = useRef(null);
  const sourcesSectionRef = useRef(null);
  const destinationSectionRef = useRef(null);
  const quoteSectionRef = useRef(null);
  const swapSectionRef = useRef(null);
  const statusSectionRef = useRef(null);

  const availableNetworks = useMemo(() => ['Base', 'Linea', 'Zora', 'Optimism'], []);
  const availableTokens = useMemo(() => ['ETH', 'USDC', 'USDT'], []);

  const renderResultBanner = (banner) => {
    if (!banner) return null;
    const palette =
      banner.variant === 'success'
        ? 'border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-100'
        : banner.variant === 'error'
          ? 'border-rose-300/70 bg-rose-50 text-rose-900 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-rose-100'
          : 'border-slate-200/70 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200';

    return (
      <div className={`rounded-2xl border px-4 py-3 text-sm ${palette}`}>
        {banner.message}
      </div>
    );
  };

  const renderApiActivityPanel = (entries) => {
    const latest = entries[0];

    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">Live Responses</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">API Activity</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">Recent requests and payloads appear here.</p>
          </div>
          {latest && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                latest.status === 'success'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100'
                  : 'bg-rose-100 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100'
              }`}
            >
              {latest.httpStatus ?? '--'}
            </span>
          )}
        </div>

        {!latest ? (
          <div className="rounded-2xl border border-dashed border-slate-200/70 p-5 text-center text-sm text-slate-600 shadow-inner dark:border-white/10 dark:text-slate-200">
            Run any request to populate this panel with live payloads.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Latest Request</p>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {latest.method} <span className="font-mono text-xs">{latest.endpoint}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : 'Just now'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">cURL</p>
              <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-slate-950/95 px-4 py-3 text-[11px] leading-5 text-white shadow-inner dark:bg-black">
{latest.curl}
              </pre>
            </div>

            <div className="grid gap-3 text-xs md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Request</p>
                <pre className="mt-2 max-h-48 overflow-auto rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 font-mono text-[11px] leading-5 text-slate-900 dark:border-white/10 dark:bg-slate-900/50 dark:text-white">
{toJsonString(latest.requestPayload)}
                </pre>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Response</p>
                <pre className="mt-2 max-h-48 overflow-auto rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 font-mono text-[11px] leading-5 text-slate-900 dark:border-white/10 dark:bg-slate-900/50 dark:text-white">
{toJsonString(latest.responsePayload)}
                </pre>
              </div>
            </div>

            {entries.length > 1 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">History</p>
                <div className="mt-2 space-y-2">
                  {entries.slice(1).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200/60 px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-slate-900/50"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {entry.method} <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{entry.endpoint}</span>
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">{entry.label}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          entry.status === 'success'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100'
                            : 'bg-rose-100 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100'
                        }`}
                      >
                        {entry.httpStatus ?? '--'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSourceSelection = ({ sectionId, sectionRef, config, selectedSource, selectedSourceToken, onSelect, loading, banner, sources, fetchSources }) => (
    <div ref={sectionRef} id={sectionId} className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">Step 2</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Select source network</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            We only show networks that can generate deposit addresses for your selected destination.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSources}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Get Sources'}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {renderResultBanner(banner)}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((network) => {
            const tokens = network.tokens || [];
            const tokenSummary = tokens
              .map((token) => token.symbol || token.asset)
              .filter(Boolean)
              .slice(0, 3)
              .join(', ');
            const isActive = selectedSource === network.name;

            return (
              <div
                key={network.name}
                className={`flex h-full flex-col gap-2 rounded-2xl border px-4 py-3 shadow-sm transition hover:border-rose-500/40 hover:shadow-md dark:bg-slate-900/50 ${
                  isActive
                    ? 'border-rose-500/60 bg-rose-600/5 dark:border-rose-500/60 dark:bg-rose-600/10'
                    : 'border-slate-200/70 bg-white dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {network.logo && (
                    <img src={network.logo} alt={network.display_name || network.name} className="h-8 w-8 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{network.display_name || network.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">
                      {network.name.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{tokenSummary || 'Tokens pending'}</p>
                {Boolean(tokens.length) && (
                  <div className="flex flex-wrap gap-1">
                    {tokens.map((token) => {
                      const symbol = token.symbol || token.asset;
                      if (!symbol) return null;
                      const tokenSelected = isActive && selectedSourceToken === symbol;
                      return (
                        <button
                          key={`${network.name}-${symbol}`}
                          type="button"
                          onClick={() => onSelect({ network: network.name, token: symbol })}
                          className={`rounded-full px-2 py-1 text-[11px] font-medium transition ${
                            tokenSelected
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-900 hover:bg-rose-600/20 hover:text-rose-600 dark:bg-white/10 dark:text-white'
                          }`}
                          aria-pressed={tokenSelected}
                        >
                          {symbol}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!sources.length && !loading && (
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Run the request to see live networks tailored to your destination.
          </p>
        )}
      </div>
    </div>
  );

  const renderDestinationTokensStep = ({
    sectionId,
    sectionRef,
    config,
    selectedSource,
    selectedSourceToken,
    selectedToken,
    onSelectToken,
    loading,
    banner,
    tokens,
    fetchDestinations,
    stepLabel,
  }) => {
    if (config.tokenMode === 'single') return null;

    return (
      <div ref={sectionRef} id={sectionId} className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">{stepLabel}</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Destination tokens</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Discover what your users can receive on your destination network after starting from the selected source.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchDestinations}
            disabled={loading || !selectedSource || !selectedSourceToken}
            className="inline-flex items-center justify-center rounded-xl border border-rose-500/30 px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-500 hover:bg-rose-600/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-400"
          >
            {loading ? 'Loading…' : 'Load destination tokens'}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {renderResultBanner(banner)}
          {tokens.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {tokens.map((destination) => {
                const symbol = destination.token?.symbol || destination.token?.asset;
                const networkName = destination.network?.display_name || destination.network?.name || 'Destination';
                const isSelected = selectedToken === symbol;

                return (
                  <button
                    key={`${networkName}-${symbol}`}
                    type="button"
                    disabled={!symbol}
                    onClick={() => (symbol ? onSelectToken(symbol) : undefined)}
                    aria-pressed={isSelected}
                    className={`text-left transition ${
                      isSelected
                        ? 'rounded-2xl border-2 border-rose-500/60 bg-rose-600/10 px-4 py-3 shadow-sm'
                        : 'rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm hover:border-rose-500/40 dark:border-white/10 dark:bg-slate-900/50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{networkName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Token: {symbol || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Deposit methods: {(destination.deposit_methods || []).join(', ') || 'N/A'}
                    </p>
                    {isSelected && (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">
                        Selected
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedSource ? 'Run the request to load destination tokens.' : 'Select a source network to continue.'}
            </p>
          )}
        </div>
    </div>
  );
};

  const getStatusBadgeClasses = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed') return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100';
    if (normalized === 'failed' || normalized === 'cancelled') return 'bg-rose-100 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100';
    if (normalized === 'pending' || normalized === 'waiting' || normalized === 'created') return 'bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100';
    return 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white';
  };

  const pushActivity = (entry) => {
    setApiActivity((prev) => [entry, ...prev].slice(0, 6));
  };

  const buildHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (config.apiKey.trim()) {
      headers['X-LS-APIKEY'] = config.apiKey.trim();
    }
    return headers;
  };

  const callApi = async ({ label, endpoint, method = 'GET', params, body }) => {
    const url = new URL(`${API_BASE}${endpoint}`);
    const queryPayload = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        const stringValue = typeof value === 'boolean' ? String(value) : value;
        url.searchParams.append(key, stringValue);
        queryPayload[key] = stringValue;
      });
    }

    const options = { method, headers: buildHeaders() };
    if (body && method.toUpperCase() !== 'GET') {
      options.body = JSON.stringify(body);
    }

    let httpStatus = null;
    let responsePayload = null;
    let success = false;
    let errorMessage = '';

    try {
      const response = await fetch(url.toString(), options);
      httpStatus = response.status;
      const raw = await response.text();
      try {
        responsePayload = raw ? JSON.parse(raw) : {};
      } catch (error) {
        responsePayload = { raw };
      }
      if (!response.ok) {
        errorMessage = responsePayload?.error?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }
      success = true;
      return responsePayload;
    } catch (error) {
      if (!errorMessage) errorMessage = error.message;
      throw error;
    } finally {
      pushActivity({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        label,
        method: method.toUpperCase(),
        endpoint: `${url.pathname}${url.search}`,
        httpStatus,
        status: success ? 'success' : 'error',
        requestPayload: method.toUpperCase() === 'GET' ? (Object.keys(queryPayload).length ? queryPayload : null) : body,
        responsePayload: responsePayload ?? { error: errorMessage || 'Request failed' },
        curl: buildCurlCommand({
          method,
          endpoint: `${url.pathname}${url.search}`,
          body: method.toUpperCase() === 'GET' ? null : body,
          apiKey: config.apiKey.trim(),
        }),
        timestamp: new Date().toISOString(),
      });
    }
  };

  const cleanupTrackingIntervals = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const stopTracking = (message, variant = 'info') => {
    cleanupTrackingIntervals();
    setIsTracking(false);
    setRefreshCountdown(null);
    if (message) {
      setStatusBanner({ variant, message });
    }
  };

  const pollSwapStatus = async () => {
    if (!swapState.swapId) return;
    try {
      const payload = await callApi({
        label: 'Check swap status',
        endpoint: `/swaps/${swapState.swapId}`,
      });
      const swap = payload?.data?.swap || payload?.data;
      if (!swap) {
        throw new Error('Swap not found.');
      }

      const sourceNetworkName = swap.source_network?.display_name || swap.source_network?.name || selectedSource || 'Source network';
      const destinationNetworkName =
        swap.destination_network?.display_name || swap.destination_network?.name || config.destinationNetwork || 'Destination network';
      const sourceTokenSymbol = swap.source_token?.symbol || selectedSourceToken || swap.source_token || '';
      const destinationTokenSymbol =
        swap.destination_token?.symbol || (config.tokenMode === 'single' ? config.destinationToken : selectedDestinationToken) || '';

      const transactions = Array.isArray(swap.transactions) ? swap.transactions : [];
      const inputs = transactions.filter((tx) => tx.type === 'input');
      const outputs = transactions.filter((tx) => tx.type === 'output');

      setStatusSnapshot({
        status: swap.status || '',
        source: { network: sourceNetworkName, token: sourceTokenSymbol, logo: swap.source_network?.logo },
        destination: { network: destinationNetworkName, token: destinationTokenSymbol, logo: swap.destination_network?.logo },
        inputs,
        outputs,
        lastUpdated: Date.now(),
      });

      if (swap.status) {
        setStatusBanner({ variant: 'success', message: `Status: ${swap.status}` });
      }

      setRefreshCountdown(STATUS_POLL_INTERVAL_MS / 1000);

      const normalized = (swap.status || '').toLowerCase();
      if (TERMINAL_SWAP_STATUSES.includes(normalized)) {
        stopTracking(`Swap ${normalized}.`, normalized === 'completed' ? 'success' : 'error');
      }
    } catch (error) {
      setStatusBanner({ variant: 'error', message: error?.message || 'Failed to check swap status.' });
      setRefreshCountdown(STATUS_POLL_INTERVAL_MS / 1000);
    }
  };

  const handleTrackSwap = async () => {
    if (!swapState.swapId) {
      setStatusBanner({ variant: 'error', message: 'Create a swap in Step 4 to track its status.' });
      return;
    }

    if (isTracking) {
      stopTracking('Tracking stopped.');
      return;
    }

    setIsTracking(true);
    setStatusBanner({ variant: 'info', message: 'Tracking swap status (updates every 5s)…' });

    await pollSwapStatus();

    setRefreshCountdown(STATUS_POLL_INTERVAL_MS / 1000);
    trackingIntervalRef.current = setInterval(pollSwapStatus, STATUS_POLL_INTERVAL_MS);
    countdownIntervalRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (!prev || prev <= 1) {
          return STATUS_POLL_INTERVAL_MS / 1000;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const renderTransactionsColumn = (title, entries, emptyCopy) => (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      {entries.length ? (
        <div className="mt-3 space-y-3">
          {entries.map((tx, index) => {
            const explorerUrl =
              tx.transaction_hash && tx.network?.transaction_explorer_template
                ? tx.network.transaction_explorer_template.replace('{0}', tx.transaction_hash)
                : null;
            const timestamp = formatTimestamp(tx.timestamp);
            const tokenLabel = tx.token?.symbol || tx.token?.asset || 'Token';
            const amountLabel = `${formatAmount(tx.amount)} ${tokenLabel}`.trim();
            const shortHash = shortenHash(tx.transaction_hash);
            const key = tx.transaction_hash || tx.id || `${tx.type || 'tx'}-${tx.timestamp || index}`;

            return (
              <div
                key={key}
                className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{amountLabel}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {tx.network?.display_name || tx.network?.name || 'Network'}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClasses(tx.status)}`}>
                    {tx.status || 'pending'}
                  </span>
                </div>
                {timestamp && <p className="text-xs text-slate-500 dark:text-slate-400">Updated {timestamp}</p>}
                {shortHash &&
                  (explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-rose-600 dark:text-rose-300 hover:underline"
                    >
                      {shortHash}
                    </a>
                  ) : (
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300">{shortHash}</p>
                  ))}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{emptyCopy}</p>
      )}
    </div>
  );

  const handleSourceSelect = ({ network, token }) => {
    setSelectedSource(network);
    setSelectedSourceToken(token);
  };

  const handleDestinationTokenSelect = (token) => {
    setSelectedDestinationToken(token);
    setQuoteState(getEmptyQuoteState());
    setSwapState(getEmptySwapState());
  };

  const handleFetchSources = async () => {
    setSourceLoading(true);
    setSourceBanner({ variant: 'info', message: 'Fetching sources…' });
    try {
      const payload = await callApi({
        label: 'Get sources',
        endpoint: '/sources',
        params: {
          destination_network: config.destinationNetwork,
          has_deposit_address: 'true',
          destination_token: config.tokenMode === 'single' ? config.destinationToken : undefined,
        },
      });
      const networks = payload?.data ?? [];
      setSources(networks);
      setSourceBanner({ variant: 'success', message: `Found ${networks.length} available network${networks.length === 1 ? '' : 's'}` });
    } catch (error) {
      console.error(error);
      setSources([]);
      setSourceBanner({ variant: 'error', message: error?.message || 'Unable to load sources. Please retry.' });
    } finally {
      setSourceLoading(false);
    }
  };

  const handleFetchDestinationTokens = async () => {
    if (!selectedSource || !selectedSourceToken) {
      setDestinationBanner({ variant: 'error', message: 'Select a source network and token first.' });
      return;
    }

    setDestinationLoading(true);
    setDestinationBanner({ variant: 'info', message: 'Fetching destination tokens…' });

    try {
      const payload = await callApi({
        label: 'Get destinations',
        endpoint: '/destinations',
        params: {
          source_network: selectedSource,
          source_token: selectedSourceToken,
          destination_network: config.destinationNetwork,
        },
      });
      const result = payload?.data ?? [];
      setDestinationTokens(result);
      setSelectedDestinationToken('');
      setDestinationBanner({ variant: 'success', message: `Found ${result.length} destination token(s)` });
    } catch (error) {
      console.error(error);
      setDestinationTokens([]);
      setDestinationBanner({ variant: 'error', message: error?.message || 'Failed to fetch destinations' });
    } finally {
      setDestinationLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (!selectedSource || !selectedSourceToken) {
      setQuoteState({ ...getEmptyQuoteState(), banner: { variant: 'error', message: 'Select a source network and token first.' } });
      return;
    }

    if (!config.walletAddress.trim()) {
      setQuoteState({ ...getEmptyQuoteState(), banner: { variant: 'error', message: 'Enter a destination wallet address first.' } });
      return;
    }

    if (config.tokenMode === 'multiple' && !selectedDestinationToken) {
      setQuoteState({ ...getEmptyQuoteState(), banner: { variant: 'error', message: 'Pick a destination token first.' } });
      return;
    }

    setQuoteState((prev) => ({ ...prev, loading: true, banner: { variant: 'info', message: 'Fetching quote…' } }));
    try {
      const payload = await callApi({
        label: 'Get detailed quote',
        endpoint: '/detailed_quote',
        params: {
          source_network: selectedSource,
          source_token: selectedSourceToken,
          destination_network: config.destinationNetwork,
          destination_token: config.tokenMode === 'single' ? config.destinationToken : selectedDestinationToken,
          destination_address: config.walletAddress,
          refuel: 'false',
        },
      });

      const routes = payload?.data ?? [];
      if (!routes.length) {
        throw new Error('No quotes available for this route.');
      }

      setQuoteState({ routes, loading: false, banner: { variant: 'success', message: `Found ${routes.length} liquidity path${routes.length > 1 ? 's' : ''}` } });
    } catch (error) {
      console.error(error);
      setQuoteState({ ...getEmptyQuoteState(), banner: { variant: 'error', message: error?.message || 'Unable to fetch quote.' } });
    }
  };

  const handleCreateSwap = async () => {
    if (!selectedSource || !selectedSourceToken) {
      setSwapState({ ...getEmptySwapState(), banner: { variant: 'error', message: 'Select a source network and token first.' } });
      return;
    }

    if (!config.walletAddress.trim()) {
      setSwapState({ ...getEmptySwapState(), banner: { variant: 'error', message: 'Enter a destination wallet address first.' } });
      return;
    }

    if (config.tokenMode === 'multiple' && !selectedDestinationToken) {
      setSwapState({ ...getEmptySwapState(), banner: { variant: 'error', message: 'Pick a destination token before creating a swap.' } });
      return;
    }

    if (!quoteState.routes.length) {
      setSwapState({ ...getEmptySwapState(), banner: { variant: 'error', message: 'Run the quote step to unlock swap creation.' } });
      return;
    }

    const body = {
      source_network: selectedSource,
      source_token: selectedSourceToken,
      destination_network: config.destinationNetwork,
      destination_token: config.tokenMode === 'single' ? config.destinationToken : selectedDestinationToken,
      destination_address: config.walletAddress,
      refuel: false,
      use_deposit_address: true,
    };

    setSwapState((prev) => ({ ...prev, loading: true, banner: { variant: 'info', message: 'Creating swap…' } }));

    try {
      const payload = await callApi({ label: 'Create swap', endpoint: '/swaps', method: 'POST', body });
      const swap = payload?.data?.swap;
      if (!swap?.id) {
        throw new Error('No swap ID returned from API.');
      }

      const depositAction = payload?.data?.deposit_actions?.[0];
      const depositAddress = depositAction?.to_address || swap?.deposit_address || '';
      const depositNetwork = swap.source_network?.display_name || swap.source_network?.name || selectedSource;
      const depositToken = swap.source_token?.symbol || swap.source_token || selectedSourceToken;

      setSwapState({
        swapId: swap.id,
        depositAddress: depositAddress || 'Pending - check status for deposit address',
        depositNetwork,
        depositToken,
        banner: { variant: 'success', message: 'Swap created successfully. Send funds to the deposit address to proceed.' },
        loading: false,
      });
    } catch (error) {
      console.error(error);
      setSwapState({ ...getEmptySwapState(), banner: { variant: 'error', message: error?.message || 'Failed to create swap.' }, loading: false });
    }
  };

  const handleCopyDepositAddress = async () => {
    if (!swapState.depositAddress) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(swapState.depositAddress);
        setCopyNotice('Copied to clipboard');
      } else {
        setCopyNotice('Clipboard API unavailable');
      }
    } catch (error) {
      setCopyNotice('Copy failed. Please copy manually.');
    } finally {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopyNotice(''), 2200);
    }
  };

  useEffect(() => {
    setSelectedSource(null);
    setSelectedSourceToken('');
    setSelectedDestinationToken('');
    setSources([]);
    setDestinationTokens([]);
    setQuoteState(getEmptyQuoteState());
    setSwapState(getEmptySwapState());
  }, [config.destinationNetwork, config.destinationToken]);

  useEffect(() => {
    if (config.tokenMode === 'single') {
      setSelectedDestinationToken('');
      setDestinationTokens([]);
    }
    setQuoteState(getEmptyQuoteState());
    setSwapState(getEmptySwapState());
  }, [config.tokenMode]);

  useEffect(() => {
    setQuoteState(getEmptyQuoteState());
    setSwapState(getEmptySwapState());
  }, [selectedSource, selectedSourceToken]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setCopyNotice('');
  }, [swapState.depositAddress]);

  useEffect(() => {
    cleanupTrackingIntervals();
    setIsTracking(false);
    setRefreshCountdown(null);
    setStatusSnapshot({
      status: '',
      source: null,
      destination: null,
      inputs: [],
      outputs: [],
      lastUpdated: null,
    });
    setStatusBanner(null);
  }, [swapState.swapId]);

  useEffect(() => {
    return () => {
      cleanupTrackingIntervals();
    };
  }, []);

  useEffect(() => {
    if (!steps.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const stepId = visible[0].target.getAttribute('data-step-id');
          if (stepId && stepId !== activeStep) {
            setActiveStep(stepId);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0.2 }
    );

    steps.forEach((step) => {
      const ref = sectionRefMap[step.id];
      if (ref?.current) {
        ref.current.dataset.stepId = step.id;
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [steps, activeStep]);

  const needsDestinationStep = config.tokenMode === 'multiple';
  const destinationTokenForQuote = config.tokenMode === 'single' ? config.destinationToken : selectedDestinationToken;
  const canQuote = Boolean(selectedSource && selectedSourceToken && destinationTokenForQuote && config.walletAddress.trim());
  const canCreateSwap = canQuote && quoteState.routes.length > 0 && !swapState.loading;
  const quoteStepLabel = needsDestinationStep ? 'Step 4' : 'Step 3';
  const swapStepLabel = needsDestinationStep ? 'Step 5' : 'Step 4';
  const statusStepLabel = needsDestinationStep ? 'Step 6' : 'Step 5';
  const trackingCountdownLabel = isTracking && typeof refreshCountdown === 'number' ? `Refreshing in ${refreshCountdown}s` : null;
  const hasConfigBasics = Boolean(config.walletAddress.trim());
  const hasSourceSelection = Boolean(selectedSource && selectedSourceToken);
  const hasDestinationChoice = config.tokenMode === 'single' ? Boolean(config.destinationToken) : Boolean(selectedDestinationToken);
  const hasQuoteResult = quoteState.routes.length > 0;
  const hasSwapRecord = Boolean(swapState.swapId);
  const hasStatusSnapshot = Boolean(statusSnapshot.status);
  const isStatusTerminal = TERMINAL_SWAP_STATUSES.includes((statusSnapshot.status || '').toLowerCase());
  const sectionRefMap = {
    config: configSectionRef,
    sources: sourcesSectionRef,
    destination: destinationSectionRef,
    quote: quoteSectionRef,
    swap: swapSectionRef,
    status: statusSectionRef,
  };

  const steps = useMemo(() => {
    let stepNumber = 1;
    const entries = [];

    entries.push({
      id: 'config',
      number: stepNumber++,
      title: 'Setup destination',
      locked: false,
      completed: hasConfigBasics,
    });

    entries.push({
      id: 'sources',
      number: stepNumber++,
      title: 'Select source',
      locked: false,
      completed: hasSourceSelection,
    });

    if (needsDestinationStep) {
      entries.push({
        id: 'destination',
        number: stepNumber++,
        title: 'Destination tokens',
        locked: !hasSourceSelection,
        completed: hasDestinationChoice && destinationTokens.length > 0,
      });
    }

    entries.push({
      id: 'quote',
      number: stepNumber++,
      title: 'Get quote',
      locked: needsDestinationStep ? !hasDestinationChoice : !hasSourceSelection,
      completed: hasQuoteResult,
    });

    entries.push({
      id: 'swap',
      number: stepNumber++,
      title: 'Create swap',
      locked: !hasQuoteResult,
      completed: hasSwapRecord,
    });

    entries.push({
      id: 'status',
      number: stepNumber++,
      title: 'Track status',
      locked: !hasSwapRecord,
      completed: hasStatusSnapshot && isStatusTerminal,
    });

    return entries;
  }, [hasConfigBasics, hasSourceSelection, hasDestinationChoice, destinationTokens.length, needsDestinationStep, hasQuoteResult, hasSwapRecord, hasStatusSnapshot, isStatusTerminal]);

  const handleNavClick = (stepId) => {
    const target = sectionRefMap[stepId]?.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveStep(stepId);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">Deposit API Tutorial</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">Accept deposits from any chain</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Configure your destination once, then run each API step with live responses inside this page.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8 xl:flex-row">
        <aside className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 xl:sticky xl:top-24 xl:w-64 xl:flex-shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">API Walkthrough</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Jump between steps and see what’s unlocked.</p>
          <div className="mt-4 flex flex-col gap-2">
            {steps.map((step) => {
              const isActive = activeStep === step.id;
              const stateClasses = step.locked
                ? 'opacity-50 cursor-not-allowed'
                : isActive
                  ? 'border-rose-500 bg-rose-600/10 text-rose-600 dark:text-rose-300'
                  : step.completed
                    ? 'border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100'
                    : 'border-slate-200/70 bg-white text-slate-900 hover:border-rose-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-white';
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleNavClick(step.id)}
                  disabled={step.locked}
                  className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left text-sm transition ${stateClasses}`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.32em]">{`Step ${step.number}`}</span>
                  <span className="font-semibold">{step.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex flex-1 flex-col gap-8 xl:flex-row-reverse">
          <aside className="xl:w-[24rem] xl:flex-shrink-0">
            {renderApiActivityPanel(apiActivity)}
          </aside>

          <div className="flex-1 space-y-6">
            <div ref={configSectionRef} id="section-config" className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Configuration</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Set your credentials and preferred destination details. These values will be used for each API step.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:text-slate-300" htmlFor="apiKey">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="text"
                  className="w-full rounded-lg border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-500/30"
                  placeholder="Optional - for higher rate limits"
                  value={config.apiKey}
                  onChange={(event) => setConfig((prev) => ({ ...prev, apiKey: event.target.value }))}
                />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Use a production key in live environments; leave blank to run requests without authentication.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:text-slate-300" htmlFor="walletAddress">
                  Wallet Address
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  className="w-full rounded-lg border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-500/30"
                  placeholder="0x..."
                  value={config.walletAddress}
                  onChange={(event) => setConfig((prev) => ({ ...prev, walletAddress: event.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:text-slate-300" htmlFor="destinationNetwork">
                    Destination Network
                  </label>
                  <select
                    id="destinationNetwork"
                    className="w-full appearance-none rounded-lg border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-500/30"
                    value={config.destinationNetwork}
                    onChange={(event) => setConfig((prev) => ({ ...prev, destinationNetwork: event.target.value }))}
                  >
                    {availableNetworks.map((network) => (
                      <option key={network} value={network}>
                        {network}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:text-slate-300" htmlFor="destinationToken">
                    Destination Token
                  </label>
                  <select
                    id="destinationToken"
                    className="w-full appearance-none rounded-lg border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-500/30"
                    value={config.destinationToken}
                    onChange={(event) => setConfig((prev) => ({ ...prev, destinationToken: event.target.value }))}
                    disabled={config.tokenMode === 'multiple'}
                  >
                    {availableTokens.map((token) => (
                      <option key={token} value={token}>
                        {token}
                      </option>
                    ))}
                  </select>
                  {config.tokenMode === 'multiple' && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">Destination token is selected later when multiple-token mode is enabled.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:text-slate-300">Token Mode</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Single token', value: 'single', description: 'Specify destination network + token upfront.' },
                    { label: 'Multiple tokens', value: 'multiple', description: 'Let the user pick the destination token later.' },
                  ].map((option) => {
                    const isActive = config.tokenMode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, tokenMode: option.value }))}
                        className={`rounded-2xl border px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-rose-500/30 dark:focus:ring-rose-500/40 ${
                          isActive
                            ? 'border-rose-500/60 bg-rose-600/10 text-rose-600 dark:border-rose-500/70 dark:bg-rose-600/20'
                            : 'border-slate-200/70 bg-white text-slate-900 hover:border-rose-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-white'
                        }`}
                      >
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {renderSourceSelection({
            sectionId: 'section-sources',
            sectionRef: sourcesSectionRef,
            config,
            selectedSource,
            selectedSourceToken,
            onSelect: handleSourceSelect,
            loading: sourceLoading,
            banner: sourceBanner,
            sources,
            fetchSources: handleFetchSources,
          })}

          {renderDestinationTokensStep({
            sectionId: 'section-destination',
            sectionRef: destinationSectionRef,
            config,
            selectedSource,
            selectedSourceToken,
            selectedToken: selectedDestinationToken,
            onSelectToken: handleDestinationTokenSelect,
            loading: destinationLoading,
            banner: destinationBanner,
            tokens: destinationTokens,
            fetchDestinations: handleFetchDestinationTokens,
            stepLabel: 'Step 3',
          })}

          <div ref={quoteSectionRef} id="section-quote" className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">{quoteStepLabel}</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Get a detailed quote</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Preview fees, limits, and timing for {config.destinationNetwork} ({destinationTokenForQuote || 'token'}) deliveries.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGetQuote}
                disabled={!canQuote || quoteState.loading}
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {quoteState.loading ? 'Loading…' : 'Get detailed quote'}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {renderResultBanner(quoteState.banner)}
              {quoteState.routes.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {quoteState.routes.map((route, index) => {
                    const pathNames = (route.path || [])
                      .map((hop) => hop.network?.display_name || hop.network?.name || hop.type)
                      .filter(Boolean);
                    const feeParts = [];
                    if (route.total_percentage_fee) feeParts.push(`${formatAmount(route.total_percentage_fee)}%`);
                    if (route.total_fixed_fee_in_usd) feeParts.push(`$${formatAmount(route.total_fixed_fee_in_usd)}`);
                    return (
                      <div
                        key={`${route.id || route.path?.length || 'route'}-${index}`}
                        className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/50"
                      >
                        {pathNames.length > 0 && (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-600 dark:text-rose-400">
                            {pathNames.join(' → ')}
                          </p>
                        )}
                        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Amount range</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                              {formatAmount(route.min_amount)} - {formatAmount(route.max_amount)} {selectedSourceToken || ''}
                            </p>
                            {(route.min_amount_in_usd || route.max_amount_in_usd) && (
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                ${formatAmount(route.min_amount_in_usd)} - ${formatAmount(route.max_amount_in_usd)}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Avg. completion</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{formatDuration(route.avg_completion_milliseconds)}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Includes bridge + onchain confirmations</p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                          <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Min fee</p>
                            <p className="text-sm font-semibold">{formatAmount(route.fee_amount_for_min)} {selectedSourceToken || ''}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Max fee</p>
                            <p className="text-sm font-semibold">{formatAmount(route.fee_amount_for_max)} {selectedSourceToken || ''}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Fee structure</p>
                            <p className="text-sm font-semibold">{feeParts.length ? feeParts.join(' + ') : 'No fees'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select a source, destination, and wallet address, then run the quote to preview live liquidity routes.
                </p>
              )}
            </div>
          </div>

          <div ref={swapSectionRef} id="section-swap" className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">{swapStepLabel}</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create swap</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Generate a deposit address that your users can fund to start the transfer.</p>
              </div>
              <button
                type="button"
                onClick={handleCreateSwap}
                disabled={!canCreateSwap}
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {swapState.loading ? 'Creating…' : 'Create swap'}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {renderResultBanner(swapState.banner)}

              <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Source</dt>
                  <dd className="text-base font-semibold text-slate-900 dark:text-white">{selectedSource || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Source token</dt>
                  <dd className="text-base font-semibold text-slate-900 dark:text-white">{selectedSourceToken || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Destination</dt>
                  <dd className="text-base font-semibold text-slate-900 dark:text-white">
                    {config.destinationNetwork} ({destinationTokenForQuote || 'token'})
                  </dd>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Destination address</dt>
                  <dd className="font-mono text-xs text-slate-900 dark:text-white">
                    {config.walletAddress || '—'}
                  </dd>
                </div>
              </dl>

              {swapState.swapId ? (
                <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm shadow-inner dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Swap ID</p>
                      <p className="font-mono text-xs text-slate-900 dark:text-white">{swapState.swapId}</p>
                    </div>
                    <span className="rounded-full bg-rose-600/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-600/20 dark:text-rose-400">
                      {swapState.depositNetwork} · {swapState.depositToken}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-white">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Deposit address</p>
                        <p className="font-mono text-xs text-slate-900 dark:text-white break-all">{swapState.depositAddress}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyDepositAddress}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200/70 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:border-rose-500 hover:text-rose-600 dark:border-white/20 dark:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    {copyNotice && <p className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">{copyNotice}</p>}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Send {swapState.depositToken} on {swapState.depositNetwork} to start the transfer. Track status in the API reference after funding.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Complete the quote step to unlock swap creation and receive a deposit address.
                </p>
              )}
            </div>
          </div>

          <div ref={statusSectionRef} id="section-status" className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-600 dark:text-rose-400">{statusStepLabel}</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Track swap status</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Poll the API for real-time updates and surface the on-chain deposit + withdrawal transactions.
                </p>
                {swapState.swapId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Monitoring swap <span className="font-mono">{swapState.swapId}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleTrackSwap}
                  disabled={!swapState.swapId && !isTracking}
                  className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTracking ? 'Stop tracking' : 'Check status'}
                </button>
                {trackingCountdownLabel && (
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{trackingCountdownLabel}</p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {renderResultBanner(statusBanner)}

              {statusSnapshot.source && statusSnapshot.destination ? (
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">Current status</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{statusSnapshot.status || 'Pending'}</p>
                      {statusSnapshot.lastUpdated && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Updated {formatTimestamp(statusSnapshot.lastUpdated)}
                        </p>
                      )}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(statusSnapshot.status)}`}>
                      {statusSnapshot.status || 'pending'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 text-xs dark:border-white/10">
                      {statusSnapshot.source.logo && (
                        <img
                          src={statusSnapshot.source.logo}
                          alt={statusSnapshot.source.network}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      )}
                      {statusSnapshot.source.network} · {statusSnapshot.source.token}
                    </span>
                    <span className="text-base text-slate-500 dark:text-slate-300">→</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-1 text-xs dark:border-white/10">
                      {statusSnapshot.destination.logo && (
                        <img
                          src={statusSnapshot.destination.logo}
                          alt={statusSnapshot.destination.network}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      )}
                      {statusSnapshot.destination.network} · {statusSnapshot.destination.token}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Create a swap and start tracking to see live status updates and transaction history.
                </p>
              )}

              <div className="grid gap-3 rounded-2xl border border-dashed border-slate-200/70 p-4 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300 md:grid-cols-2">
                {STATUS_GUIDE.map((entry) => (
                  <div key={entry.code} className="flex gap-2 rounded-xl border border-slate-200/40 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-slate-900/40">
                    <span className="min-w-[140px] font-semibold uppercase tracking-[0.18em] text-slate-900 dark:text-white">{entry.code}</span>
                    <span>{entry.description}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {renderTransactionsColumn('Deposit activity', statusSnapshot.inputs || [], 'Awaiting deposit transactions.')}
                {renderTransactionsColumn('Withdrawal activity', statusSnapshot.outputs || [], 'No withdrawals yet.')}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-8 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Need help with integration?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Our solutions engineers can help you customize the Deposit API experience, review configs, or ship new features faster.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:partners@layerswap.io"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              >
                <span className="text-base">✉️</span>
                partners@layerswap.io
              </a>
              <a
                href="https://t.me/layerswap_dev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              >
                <span className="text-base">💬</span>
                Join the dev community
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
