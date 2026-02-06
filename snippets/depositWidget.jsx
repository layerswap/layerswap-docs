export const DepositWidget = () => {
    // ===== CONSTANTS (inside component) =====
    const API_BASE = 'https://api.layerswap.io/api/v2';
    const POLL_INTERVAL_MS = 5000;
    const API_TIMEOUT_MS = 30000;

    const FEATURED_NETWORKS = [
        'BITCOIN_MAINNET',
        'ETHEREUM_MAINNET',
        'STARKNET_MAINNET',
        'OPTIMISM_MAINNET',
        'FUEL_MAINNET',
        'BASE_MAINNET',
        'SOLANA_MAINNET',
        'TON_MAINNET',
        'TRON_MAINNET'
    ];

    // ===== UTILITY FUNCTIONS (inside component) =====
    const resolveTheme = () => {
        if (typeof document === 'undefined') return 'dark';
        const html = document.documentElement;
        const attr = html.getAttribute('data-theme');
        if (attr === 'dark') return 'dark';
        if (attr === 'light') return 'light';
        return html.classList.contains('dark') ? 'dark' : 'light';
    };


    const throttle = (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const sanitizeInput = (value) => {
        if (value == null) return '';
        return String(value)
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    };

    const formatAmount = (amount) => {
        if (!amount || amount === 'N/A') return 'N/A';
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        if (num < 0.00001) {
            return num.toFixed(8).replace(/\.?0+$/, '');
        }
        return num.toFixed(6).replace(/\.?0+$/, '');
    };

    const formatNetworkName = (name) => {
        return name.replace(/_MAINNET$/, '')
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const validateApiKey = (apiKey) => {
        if (!apiKey || apiKey.trim().length === 0) {
            return { valid: true, warning: 'No API key provided. Using default rate limits.' };
        }
        if (apiKey.trim().length < 20) {
            return { valid: false, error: 'API key appears to be invalid (too short)' };
        }
        return { valid: true };
    };

    const validateWalletAddress = (address) => {
        if (!address || address.trim().length === 0) {
            return { valid: false, error: 'Wallet address is required' };
        }
        return { valid: true };
    };

    // ===== STATE =====
    const [theme, setTheme] = useState(() => resolveTheme());
    const [apiKey, setApiKey] = useState('2XB8/E0WYmRZkwxJSB06nqL3DKy6IdlpJQr2vb6JsE8M55Dl5DmaMWMNJCzRm5bX8p/mBBn1moR+EdEzAMtb/g');
    const [walletAddress, setWalletAddress] = useState('');
    const [destinationNetwork, setDestinationNetwork] = useState('BASE_MAINNET');
    const [destinationToken, setDestinationToken] = useState('ETH');
    const [tokenMode, setTokenMode] = useState('single');
    const [sourceNetwork, setSourceNetwork] = useState('');
    const [sourceToken, setSourceToken] = useState('');
    const [destinationTokenMultiple, setDestinationTokenMultiple] = useState('');
    const [swapId, setSwapId] = useState(null);
    const [maxAmount, setMaxAmount] = useState(null);
    const [networks, setNetworks] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [sources, setSources] = useState([]);
    const [networkMap, setNetworkMap] = useState({});
    const [destinationNetworkDropdownOpen, setDestinationNetworkDropdownOpen] = useState(false);
    const [destinationTokenDropdownOpen, setDestinationTokenDropdownOpen] = useState(false);
    const [networkSearchTerm, setNetworkSearchTerm] = useState('');
    const [tokenSearchTerm, setTokenSearchTerm] = useState('');
    const [sourceSearchTerm, setSourceSearchTerm] = useState('');
    const [trackingInterval, setTrackingInterval] = useState(null);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [apiActivity, setApiActivity] = useState({
        step2: { request: null, response: null },
        step3: { request: null, response: null },
        'step3-destination': { request: null, response: null },
        step4: { request: null, response: null },
        step5: { request: null, response: null }
    });
    const [lastUpdatedApiStep, setLastUpdatedApiStep] = useState(null);
    const [highlightParam, setHighlightParam] = useState(null);

    // Validation states
    const [apiKeyError, setApiKeyError] = useState(null);
    const [walletAddressError, setWalletAddressError] = useState(null);

    // Result states for each step
    const [step2Result, setStep2Result] = useState({ message: '', variant: 'neutral', visible: false });
    const [step3Result, setStep3Result] = useState({ message: '', variant: 'neutral', visible: false });
    const [step3DestinationResult, setStep3DestinationResult] = useState({ message: '', variant: 'neutral', visible: false });
    const [step4Result, setStep4Result] = useState({ message: '', variant: 'neutral', visible: false });
    const [step5Result, setStep5Result] = useState({ message: '', variant: 'neutral', visible: false });

    // UI states
    const [showSourceNetworks, setShowSourceNetworks] = useState(false);
    const [showAllSourceNetworks, setShowAllSourceNetworks] = useState(false);
    const [showSourceTokenSelector, setShowSourceTokenSelector] = useState(false);
    const [showSelectedNetworkInfo, setShowSelectedNetworkInfo] = useState(false);
    const [openTokenDropdown, setOpenTokenDropdown] = useState(null); // Track which network card has its token dropdown open
    const [showDestinationTokens, setShowDestinationTokens] = useState(false);
    const [showSelectedDestTokenInfo, setShowSelectedDestTokenInfo] = useState(false);
    const [showAllDestinationNetworks, setShowAllDestinationNetworks] = useState(false);
    const [openDestinationTokenDropdown, setOpenDestinationTokenDropdown] = useState(null); // Track which destination network card has its token dropdown open
    const [destinationTokenDropdownSearchTerm, setDestinationTokenDropdownSearchTerm] = useState(''); // Search term for destination token dropdown
    const [showQuoteDetails, setShowQuoteDetails] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [showSwapRequestFields, setShowSwapRequestFields] = useState(false);
    const [showDepositInfo, setShowDepositInfo] = useState(false);
    const [depositAddress, setDepositAddress] = useState('');
    const [showSwapRoute, setShowSwapRoute] = useState(false);
    const [showStatusGuide, setShowStatusGuide] = useState(false);
    const [showSwapTransactions, setShowSwapTransactions] = useState(false);
    const [swapStatus, setSwapStatus] = useState(null);
    const [swapTransactions, setSwapTransactions] = useState([]);

    // Navigation states
    const [activeSection, setActiveSection] = useState('overview');
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // Loading states
    const [isLoadingStep2, setIsLoadingStep2] = useState(false);
    const [isLoadingStep3Destination, setIsLoadingStep3Destination] = useState(false);
    const [isLoadingStep3, setIsLoadingStep3] = useState(false);
    const [isLoadingStep4, setIsLoadingStep4] = useState(false);

    // Step locked states
    const [step2Locked, setStep2Locked] = useState(true);
    const [step3Locked, setStep3Locked] = useState(true);
    const [step3DestinationLocked, setStep3DestinationLocked] = useState(true);
    const [step4Locked, setStep4Locked] = useState(true);
    const [step5Locked, setStep5Locked] = useState(true);

    // Refs
    const destinationNetworkDropdownRef = useRef(null);
    const destinationTokenDropdownRef = useRef(null);
    const overviewRef = useRef(null);
    const step1Ref = useRef(null);
    const step2Ref = useRef(null);
    const step3DestinationRef = useRef(null);
    const step3Ref = useRef(null);
    const step4Ref = useRef(null);
    const step5Ref = useRef(null);
    const trackingIntervalRef = useRef(null);
    const sourceSearchInputRef = useRef(null);

    // Styles

    // ===== EFFECTS =====
    // Theme detection
    useEffect(() => {
        if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
        const html = document.documentElement;
        const updateTheme = () => setTheme(resolveTheme());
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Window resize handler
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', throttle(handleResize, 200));
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll spy for navigation
    useEffect(() => {
        const handleScroll = () => {
            const sections = [
                { id: 'overview', ref: overviewRef },
                { id: 'step1', ref: step1Ref },
                { id: 'step2', ref: step2Ref },
                { id: 'step3-destination', ref: step3DestinationRef },
                { id: 'step3', ref: step3Ref },
                { id: 'step4', ref: step4Ref },
                { id: 'step5', ref: step5Ref }
            ];

            const scrollPosition = window.scrollY + 150;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.ref.current) {
                    const offsetTop = section.ref.current.offsetTop;
                    if (scrollPosition >= offsetTop) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', throttle(handleScroll, 100));
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-clear highlight after 2 seconds
    useEffect(() => {
        if (highlightParam) {
            const timer = setTimeout(() => {
                setHighlightParam(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [highlightParam]);

    // Click outside handlers for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (destinationNetworkDropdownRef.current && !destinationNetworkDropdownRef.current.contains(event.target)) {
                setDestinationNetworkDropdownOpen(false);
            }
            if (destinationTokenDropdownRef.current && !destinationTokenDropdownRef.current.contains(event.target)) {
                setDestinationTokenDropdownOpen(false);
            }
            // Close source token dropdown when clicking outside
            if (openTokenDropdown && !event.target.closest('[data-source-card]')) {
                setOpenTokenDropdown(null);
            }
            // Close destination token dropdown when clicking outside
            if (openDestinationTokenDropdown && !event.target.closest('[data-destination-card]')) {
                setOpenDestinationTokenDropdown(null);
                setDestinationTokenDropdownSearchTerm(''); // Clear search when closing dropdown
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openTokenDropdown, openDestinationTokenDropdown]);

    // Reset showAllSourceNetworks when sources change
    useEffect(() => {
        setShowAllSourceNetworks(false);
    }, [sources]);

    // Reset showAllDestinationNetworks when networks change
    useEffect(() => {
        setShowAllDestinationNetworks(false);
    }, [networks]);

    // Scroll token dropdown into view when it opens
    useEffect(() => {
        if (openDestinationTokenDropdown) {
            setTimeout(() => {
                const cardElement = document.querySelector(`[data-destination-card][data-network-name="${openDestinationTokenDropdown}"]`);
                if (cardElement) {
                    const dropdownElement = cardElement.querySelector('[data-token-dropdown]');
                    if (dropdownElement) {
                        dropdownElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    } else {
                        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }
                }
            }, 100);
        }
    }, [openDestinationTokenDropdown]);

    // Scroll spy
    useEffect(() => {
        const sections = tokenMode === 'multiple'
            ? ['overview', 'step1', 'step2', 'step3-destination', 'step3', 'step4', 'step5']
            : ['overview', 'step1', 'step2', 'step3', 'step4', 'step5'];

        const updateActiveNav = throttle(() => {
            const offset = Math.max(window.innerHeight * 0.25, 180);
            const scrollPosition = window.scrollY + offset;
            let currentSection = sections[0] || '';

            sections.forEach(id => {
                const element = document.getElementById(id);
                if (element && element.offsetParent !== null) {
                    const offsetTop = element.offsetTop;
                    if (scrollPosition >= offsetTop) {
                        currentSection = id;
                    }
                }
            });

            if (currentSection) {
            }
        }, 100);

        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav();

        return () => window.removeEventListener('scroll', updateActiveNav);
    }, [tokenMode]);

    // Fetch destinations on mount
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const endpoint = `/destinations`;
                const response = await apiCall(endpoint, 'GET');

                if (response && response.data) {
                    const networksMap = new Map();
                    response.data.forEach(dest => {
                        if (!networksMap.has(dest.name)) {
                            networksMap.set(dest.name, {
                                name: dest.name,
                                display_name: dest.display_name,
                                logo: dest.logo,
                                chain_id: dest.chain_id,
                                type: dest.type,
                                tokens: []
                            });
                        }
                        const network = networksMap.get(dest.name);
                        if (dest.token && !network.tokens.find(t => t.symbol === dest.token.symbol)) {
                            network.tokens.push({
                                symbol: dest.token.symbol,
                                display_asset: dest.token.display_asset,
                                price_in_usd: dest.token.price_in_usd,
                                decimals: dest.token.decimals,
                                logo: dest.token.logo
                            });
                        }
                        if (dest.tokens && dest.tokens.length > 0) {
                            dest.tokens.forEach(token => {
                                if (!network.tokens.find(t => t.symbol === token.symbol)) {
                                    network.tokens.push(token);
                                }
                            });
                        }
                    });
                    const networksArray = Array.from(networksMap.values()).map(network => ({
                        ...network,
                        tokenSymbols: network.tokens.map(t => t.symbol)
                    }));
                    setNetworks(networksArray);
                    if (networksArray.length > 0) {
                        const defaultNetwork = networksArray.find(n => n.name === 'BASE_MAINNET') || networksArray[0];
                        if (defaultNetwork) {
                            setDestinationNetwork(defaultNetwork.name);
                            if (defaultNetwork.tokens && defaultNetwork.tokens.length > 0) {
                                setDestinationToken(defaultNetwork.tokens[0].symbol);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching destinations:', error);
            }
        };
        fetchDestinations();
    }, []);

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [countdownInterval]);

    // ===== API CALL FUNCTION =====
    const apiCall = useCallback(async (endpoint, method = 'GET', body = null, stepNumber = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (apiKey && apiKey.trim()) {
            headers['X-LS-APIKEY'] = apiKey;
        }

        const options = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const fullUrl = `${API_BASE}${endpoint}`;

        if (stepNumber) {
            const displayHeaders = {};
            if (apiKey && apiKey.trim()) {
                displayHeaders['X-LS-APIKEY'] = apiKey.trim();
            }
            displayHeaders['Content-Type'] = 'application/json';

            const requestData = {
                method,
                endpoint,
                url: fullUrl,
                headers: displayHeaders,
                body: body || null
            };
            updateApiSidebar(stepNumber, 'request', requestData);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        try {
            options.signal = controller.signal;
            const response = await fetch(fullUrl, options);
            clearTimeout(timeoutId);

            const text = await response.text();

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}: ${text || 'No error message'}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Expected JSON response but got: ${contentType || 'unknown'}. Response: ${text}`);
            }

            if (!text || text.trim() === '') {
                throw new Error('API returned empty response');
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error(`Failed to parse API response: ${e.message}`);
            }

            if (data.error) {
                if (stepNumber) {
                    updateApiSidebar(stepNumber, 'response', data, 'error');
                }
                if (typeof data.error === 'string') {
                    throw new Error(data.error);
                } else if (data.error.message) {
                    throw new Error(data.error.message);
                } else {
                    throw new Error(JSON.stringify(data.error));
                }
            }

            if (stepNumber) {
                updateApiSidebar(stepNumber, 'response', data, 'success');
            }

            return data;
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error(`Request timeout after ${API_TIMEOUT_MS / 1000} seconds`);
            }
            throw err;
        }
    }, [apiKey]);

    // ===== EVENT HANDLERS =====
    const handleApiKeyChange = (e) => {
        const value = sanitizeInput(e.target.value);
        setApiKey(value);
        const validation = validateApiKey(value);
        if (!validation.valid) {
            setApiKeyError(validation.error);
        } else {
            setApiKeyError(null);
        }
    };

    // Wrapper functions for Step 1 setters
    const handleDestinationNetworkChange = async (network, tokens) => {
        const wasStep2Loaded = showSourceNetworks;
        const newToken = tokens && tokens.length > 0 ? tokens[0].symbol : destinationToken;
        
        // Set the new values directly (don't use handleStepChange to avoid double refresh)
        setDestinationNetwork(network);
        if (tokens && tokens.length > 0) {
            setDestinationToken(tokens[0].symbol);
        }
        
        // If step 2 was loaded, refresh it with new destination (pass new values directly to avoid stale state)
        if (wasStep2Loaded) {
            await refreshStepAndReload(2, { destinationNetwork: network, destinationToken: newToken });
        }
    };

    const handleWalletAddressChangeWithReset = (value) => {
        // Wallet address changes don't require refreshing subsequent steps
        // The address is just the destination, so source network, token, quotes, and swaps remain valid
        setWalletAddress(value);
        const validation = validateWalletAddress(value);
        if (!validation.valid) {
            setWalletAddressError(validation.error);
        } else {
            setWalletAddressError(null);
        }
    };

    const handleDestinationTokenChange = async (token) => {
        const wasStep2Loaded = showSourceNetworks;
        
        // Set the new value directly (don't use handleStepChange to avoid double refresh)
        setDestinationToken(token);
        
        // If step 2 was loaded, refresh it with new destination token (pass new value directly to avoid stale state)
        if (wasStep2Loaded && tokenMode === 'single') {
            await refreshStepAndReload(2, { destinationNetwork, destinationToken: token });
        }
    };

    const handleWalletAddressChange = (e) => {
        const value = sanitizeInput(e.target.value);
        handleWalletAddressChangeWithReset(value);
    };

    const handleAutofillPlaceholder = () => {
        const placeholderAddress = '0xB2029bbd8C1cBCC43c3A7b7fE3d118b0C57D7C31'
        handleWalletAddressChangeWithReset(placeholderAddress);
        setWalletAddressError(null);
    };

    const handleModeChange = async (e) => {
        const mode = e.target.value;
        setTokenMode(mode);
        if (mode === 'single') {
            setStep3DestinationLocked(true);
        } else {
            setDestinationTokenMultiple('');
            setShowDestinationTokens(false);
            setShowSelectedDestTokenInfo(false);
        }
        // Refresh step 2 selections and reload data if prerequisites are met
        // Pass the new mode directly to avoid React state timing issues
        await refreshStepAndReload(2, {}, mode);
    };

    const handleGetSources = async (overrides = {}, modeOverride = null) => {
        // Use modeOverride if provided (for immediate mode changes), otherwise use current tokenMode state
        const currentMode = modeOverride ?? tokenMode;
        
        // Use overrides if provided, otherwise fall back to state values
        const destNetwork = overrides.destinationNetwork ?? destinationNetwork;
        const destToken = overrides.destinationToken ?? destinationToken;
        
        const params = new URLSearchParams();
        if (currentMode === 'single') {
            params.append('destination_network', destNetwork);
            params.append('destination_token', destToken);
        } else {
            params.append('destination_network', destNetwork);
        }
        params.append('has_deposit_address', 'true');

        const endpoint = `/sources?${params.toString()}`;
        setIsLoadingStep2(true);
        // When refreshing, keep the previous success message and just dim it
        const isRefreshing = showSourceNetworks && sources.length > 0;
        if (!isRefreshing) {
            // Hide the result box while loading (button already shows loading state)
            setStep2Result({ message: '', variant: 'neutral', visible: false });
        } else {
            // When refreshing, keep the previous message but mark it as dimmed
            setStep2Result(prev => ({ ...prev, dimmed: true }));
        }

        try {
            const data = await apiCall(endpoint, 'GET', null, 2);
            if (!data.data || data.data.length === 0) {
                setStep2Result({ message: 'No networks available for this destination.', variant: 'error', visible: true });
                return;
            }
            setStep2Result({ message: `Found ${data.data.length} available networks`, variant: 'success', visible: true, dimmed: false });
            displaySources(data.data);
        } catch (error) {
            setStep2Result({ message: `Error: ${error.message || 'Failed to fetch networks'}`, variant: 'error', visible: true });
        } finally {
            setIsLoadingStep2(false);
        }
    };

    const displaySources = (sourcesData) => {
        const networksObj = {};
        const newNetworkMap = {}; // Create new map object instead of merging
        
        sourcesData.forEach(source => {
            const networkName = source.name;
            newNetworkMap[networkName] = source; // Build new map

            if (!networksObj[networkName]) {
                networksObj[networkName] = {
                    tokens: new Set(),
                    logo: source.logo || '',
                    displayName: source.display_name || networkName
                };
            }

            if (source.tokens && Array.isArray(source.tokens)) {
                source.tokens.forEach(token => {
                    networksObj[networkName].tokens.add(token.symbol || token.asset);
                });
            }
        });

        setNetworkMap(newNetworkMap); // Replace entire map instead of merging
        setSources(Object.entries(networksObj).map(([name, info]) => ({
            name,
            ...info,
            tokens: Array.from(info.tokens)
        })));
        setShowSourceNetworks(true);
    };

    const selectSource = (network, token) => {
        handleStepChange(2, network, (value) => {
            setSourceNetwork(value);
            setSourceToken(token);
            setShowSelectedNetworkInfo(true);
            setOpenTokenDropdown(null); // Close the dropdown after selection

            if (tokenMode === 'single') {
                setStep3Locked(false);
            } else {
                setStep3DestinationLocked(false);
            }
        });
    };

    const handleSourceTokenSelect = (e) => {
        const selectedToken = e.target.value;
        if (!selectedToken) return;
        handleStepChange(2, selectedToken, (value) => {
            setSourceToken(value);
            setShowSelectedNetworkInfo(true);
            setStep3DestinationLocked(false);
        });
    };

    const selectSourceToken = (token) => {
        handleStepChange(2, token, (value) => {
            setSourceToken(value);
            setShowSelectedNetworkInfo(true);
            setStep3DestinationLocked(false);
        });
    };

    const handleGetDestinationTokens = async () => {
        const params = new URLSearchParams({
            source_network: sourceNetwork,
            source_token: sourceToken
        });
        const endpoint = `/destinations?${params.toString()}`;
        setIsLoadingStep3Destination(true);
        // Don't replace success message during loading - keep it visible but dimmed
        if (step3DestinationResult.variant !== 'success') {
            setStep3DestinationResult({ message: 'Loading...', variant: 'neutral', visible: true });
        }

        try {
            const data = await apiCall(endpoint, 'GET', null, '3-destination');
            const destinations = data.data || [];
            const ourDestination = destinations.find(d => d.name === destinationNetwork);

            if (ourDestination && ourDestination.tokens) {
                setStep3DestinationResult({
                    message: `Found ${ourDestination.tokens.length} available tokens`,
                    variant: 'success',
                    visible: true
                });
                setTokens(ourDestination.tokens);
                setShowDestinationTokens(true);
            } else {
                setStep3DestinationResult({ message: '⚠️ No tokens available for this route', variant: 'error', visible: true });
            }
        } catch (error) {
            setStep3DestinationResult({
                message: `Error: ${error.message || 'Failed to get destination tokens'}`,
                variant: 'error',
                visible: true
            });
        } finally {
            setIsLoadingStep3Destination(false);
        }
    };

    const selectDestinationToken = (token) => {
        handleStepChange(3, token, (value) => {
            setDestinationTokenMultiple(value);
            setShowSelectedDestTokenInfo(true);
            setStep3Locked(false);
        });
    };

    const handleGetQuote = async () => {
        // Validate that previous steps are completed
        if (!sourceNetwork || !sourceToken) {
            setStep3Result({
                message: 'You must complete Step 2 first',
                description: 'Please select a source network and token before getting a quote.',
                variant: 'error',
                visible: true
            });
            return;
        }

        // In multiple mode, also validate that destination token is selected
        if (tokenMode === 'multiple' && !destinationTokenMultiple) {
            setStep3Result({
                message: 'You must complete Step 3 first',
                description: 'Please select a destination token before getting a quote.',
                variant: 'error',
                visible: true
            });
            return;
        }

        // Check if there are completed steps after step 3
        const completedSteps = getCompletedSteps();
        const currentStepNum = tokenMode === 'multiple' ? 4 : 3;
        const stepsAfterStep3 = completedSteps.filter(step => {
            const stepNum = getStepNumber(step);
            return stepNum > currentStepNum;
        });
        
        // If there are completed steps after this, refresh them (clear selections but keep unlocked)
        if (stepsAfterStep3.length > 0) {
            refreshStepsFrom(currentStepNum + 1);
        }

        const params = new URLSearchParams({
            source_network: sourceNetwork,
            source_token: sourceToken,
            destination_network: destinationNetwork,
            destination_token: tokenMode === 'single' ? destinationToken : destinationTokenMultiple,
            destination_address: walletAddress,
            refuel: false
        });
        const endpoint = `/detailed_quote?${params.toString()}`;
        setIsLoadingStep3(true);
        
        // When refreshing, keep the previous success message and just dim it
        const isRefreshing = showQuoteDetails && quotes.length > 0;
        if (!isRefreshing) {
            // Hide the result box while loading (button already shows loading state)
            setStep3Result({ message: '', variant: 'neutral', visible: false });
        } else {
            // When refreshing, keep the previous message but mark it as dimmed
            setStep3Result(prev => ({ ...prev, dimmed: true }));
        }

        try {
            const data = await apiCall(endpoint, 'GET', null, 3);
            const quotesData = data.data || [];
            if (quotesData.length === 0) {
                throw new Error('No quotes available for this route');
            }
            setQuotes(quotesData);
            setMaxAmount(Math.max(...quotesData.map(q => q.max_amount || 0)));
            setStep3Result({
                message: `Found ${quotesData.length} liquidity path${quotesData.length > 1 ? 's' : ''}`,
                variant: 'success',
                visible: true
            });
            setShowQuoteDetails(true);
            setShowSwapRequestFields(true);
        } catch (error) {
            setStep3Result({ message: `Error: ${error.message || 'Failed to get quote'}`, variant: 'error', visible: true });
        } finally {
            setIsLoadingStep3(false);
        }
    };

    const handleCreateSwap = async () => {
        // Validate that previous steps are completed
        if (!sourceNetwork || !sourceToken) {
            setStep4Result({
                message: 'You must complete Step 2 first',
                description: 'Please select a source network and token before creating a swap.',
                variant: 'error',
                visible: true
            });
            return;
        }

        if (!destinationNetwork || (tokenMode === 'single' ? !destinationToken : !destinationTokenMultiple)) {
            setStep4Result({
                message: 'You must complete Step 1 first',
                description: 'Please select a destination network and token before creating a swap.',
                variant: 'error',
                visible: true
            });
            return;
        }

        if (!walletAddress) {
            setStep4Result({
                message: 'Wallet Address Required',
                description: 'Please enter your wallet address before creating a swap.',
                variant: 'error',
                visible: true
            });
            return;
        }

        // Check if there are completed steps after step 4
        const completedSteps = getCompletedSteps();
        const currentStepNum = tokenMode === 'multiple' ? 5 : 4;
        const stepsAfterStep4 = completedSteps.filter(step => {
            const stepNum = getStepNumber(step);
            return stepNum > currentStepNum;
        });
        
        // If there are completed steps after this, refresh them (clear selections but keep unlocked)
        if (stepsAfterStep4.length > 0) {
            refreshStepsFrom(currentStepNum + 1);
        }

        const swapData = {
            source_network: sourceNetwork,
            source_token: sourceToken,
            destination_network: destinationNetwork,
            destination_token: tokenMode === 'single' ? destinationToken : destinationTokenMultiple,
            destination_address: walletAddress,
            refuel: false,
            use_deposit_address: true
        };
        const endpoint = '/swaps';
        setIsLoadingStep4(true);
        // Preserve the success message if recreating (swap already exists), otherwise show loading message
        if (swapId !== null && step4Result.variant === 'success') {
            // Keep the success message visible but dimmed during loading
            setStep4Result(prev => ({ ...prev, dimmed: true }));
        } else {
            setStep4Result({ message: 'Creating swap...', variant: 'neutral', visible: true });
        }

        try {
            const data = await apiCall(endpoint, 'POST', swapData, 4);
            const newSwapId = data.data.swap.id;
            if (!newSwapId) {
                throw new Error('No swap ID returned from API');
            }
            setSwapId(newSwapId);
            setStep4Result({
                message: `Swap created: ${newSwapId}`,
                variant: 'success',
                visible: true,
                dimmed: false
            });

            const depositActions = data.data.deposit_actions || [];
            let newDepositAddress = 'N/A';
            if (depositActions.length > 0 && depositActions[0].to_address) {
                newDepositAddress = depositActions[0].to_address;
            } else {
                newDepositAddress = 'Pending - Check status for deposit address';
            }
            setDepositAddress(newDepositAddress);
            setShowDepositInfo(true);
            setStep5Locked(false);
        } catch (error) {
            setStep4Result({
                message: `Error: ${error.message || 'Failed to create swap'}`,
                variant: 'error',
                visible: true
            });
        } finally {
            setIsLoadingStep4(false);
        }
    };

    const handleTrackSwap = async () => {
        if (!swapId) {
            setStep5Result({
                message: 'Error: No swap ID found. Please create a swap first in Step 4.',
                variant: 'error',
                visible: true
            });
            return;
        }

        if (trackingInterval) {
            clearInterval(trackingInterval);
            trackingIntervalRef.current = null;
            setTrackingInterval(null);
            if (countdownInterval) {
                clearInterval(countdownInterval);
                setCountdownInterval(null);
            }
            setShowSwapRoute(false);
            setStep5Result({ message: 'Tracking stopped', variant: 'neutral', visible: true });
            return;
        }

        setShowStatusGuide(true);
        setShowSwapTransactions(true);
        setShowSwapRoute(true);
        setStep5Result({ message: 'Tracking swap status (updates every 5s)...', variant: 'neutral', visible: true });

        const track = async () => {
            try {
                const endpoint = `/swaps/${swapId}`;
                const data = await apiCall(endpoint, 'GET', null, 5);
                const swap = data.data?.swap;
                if (swap) {
                    setSwapStatus(swap);
                    const transactions = swap.transactions || [];
                    setSwapTransactions(transactions);

                    // Update deposit address if available
                    if (swap.deposit_actions && swap.deposit_actions.length > 0 && swap.deposit_actions[0].to_address) {
                        setDepositAddress(swap.deposit_actions[0].to_address);
                    }

                    // Check if swap is completed and stop tracking
                    if (swap.status === 'completed') {
                        if (trackingIntervalRef.current) {
                            clearInterval(trackingIntervalRef.current);
                            trackingIntervalRef.current = null;
                            setTrackingInterval(null);
                        }
                        if (countdownInterval) {
                            clearInterval(countdownInterval);
                            setCountdownInterval(null);
                        }
                        setStep5Result({
                            message: 'Swap completed successfully!',
                            variant: 'success',
                            visible: true
                        });
                    } else if (swap.status === 'failed') {
                        if (trackingIntervalRef.current) {
                            clearInterval(trackingIntervalRef.current);
                            trackingIntervalRef.current = null;
                            setTrackingInterval(null);
                        }
                        if (countdownInterval) {
                            clearInterval(countdownInterval);
                            setCountdownInterval(null);
                        }
                        setStep5Result({
                            message: 'Swap failed',
                            description: 'The transfer could not be completed. Please contact support for assistance.',
                            variant: 'error',
                            visible: true
                        });
                    }
                }
            } catch (error) {
                setStep5Result({
                    message: `Error: ${error.message || 'Failed to track swap'}`,
                    variant: 'error',
                    visible: true
                });
            }
        };

        track();
        const interval = setInterval(track, POLL_INTERVAL_MS);
        trackingIntervalRef.current = interval;
        setTrackingInterval(interval);
    };

    // Helper function to get step number from step ID
    const getStepNumber = (stepId) => {
        if (stepId === 'overview') return 0;
        if (stepId === 'step1') return 1;
        if (stepId === 'step2') return 2;
        if (stepId === 'step3-destination') return 3;
        if (stepId === 'step3') return tokenMode === 'multiple' ? 4 : 3;
        if (stepId === 'step4') return tokenMode === 'multiple' ? 5 : 4;
        if (stepId === 'step5') return tokenMode === 'multiple' ? 6 : 5;
        return 0;
    };

    // Helper function to get step ID from step number
    const getStepId = (stepNum) => {
        if (stepNum === 0) return 'overview';
        if (stepNum === 1) return 'step1';
        if (stepNum === 2) return 'step2';
        if (stepNum === 3 && tokenMode === 'multiple') return 'step3-destination';
        if (stepNum === 3 || (stepNum === 4 && tokenMode === 'multiple')) return 'step3';
        if (stepNum === 4 || (stepNum === 5 && tokenMode === 'multiple')) return 'step4';
        if (stepNum === 5 || (stepNum === 6 && tokenMode === 'multiple')) return 'step5';
        return '';
    };

    // Helper function to check which steps are completed
    const getCompletedSteps = () => {
        const completed = [];
        
        // Step 1 is complete if destination network and token are set
        // In multiple mode, only destination network is required (token is selected in step3-destination)
        const step1Complete = destinationNetwork && 
            (tokenMode === 'single' ? destinationToken : true);
        if (step1Complete) completed.push('step1');
        
        // Step 2 is complete if source network and token are set
        const step2Complete = sourceNetwork && sourceToken;
        if (step2Complete) completed.push('step2');
        
        // Step 3-destination is complete if destinationTokenMultiple is set (multiple mode only)
        if (tokenMode === 'multiple' && destinationTokenMultiple) {
            completed.push('step3-destination');
        }
        
        // Step 3 is complete if quotes are fetched
        if (quotes.length > 0) completed.push('step3');
        
        // Step 4 is complete if swap is created
        if (swapId) completed.push('step4');
        
        return completed;
    };

    const resetStepsFrom = (stepNum, confirmed = false) => {
        if (stepNum <= 2) {
            setSourceNetwork('');
            setSourceToken('');
            setShowSourceNetworks(false);
            setShowSelectedNetworkInfo(false);
            setShowSourceTokenSelector(false);
            setOpenTokenDropdown(null);
        }
        if (stepNum <= 3) {
            setDestinationTokenMultiple('');
            setShowDestinationTokens(false);
            setShowSelectedDestTokenInfo(false);
        }
        if (stepNum <= 3 || (stepNum === 4 && tokenMode === 'multiple')) {
            // Reset quote-related state
            setQuotes([]);
            setShowQuoteDetails(false);
            setShowSwapRequestFields(false);
            setMaxAmount(null);
            setStep3Result({ message: '', variant: 'neutral', visible: false });
        }
        if (stepNum <= 4 || (stepNum === 5 && tokenMode === 'multiple')) {
            // Reset swap-related state
            setSwapId(null);
            setDepositAddress('');
            setShowDepositInfo(false);
            setShowSwapRoute(false);
            setStep4Result({ message: '', variant: 'neutral', visible: false });
        }
        if (stepNum <= 5 || (stepNum === 6 && tokenMode === 'multiple')) {
            // Reset tracking state
            if (trackingInterval) {
                clearInterval(trackingInterval);
                setTrackingInterval(null);
            }
            if (countdownInterval) {
                clearInterval(countdownInterval);
                setCountdownInterval(null);
            }
            setStep5Result({ message: '', variant: 'neutral', visible: false });
        }

        const stepsToLock = [];
        for (let i = stepNum; i <= 6; i++) {
            const stepId = getStepId(i);
            if (stepId) stepsToLock.push(stepId);
        }

        setStep2Locked(stepNum <= 2);
        setStep3Locked(stepNum <= 3 || (stepNum === 4 && tokenMode === 'multiple'));
        setStep3DestinationLocked(stepNum <= 3);
        // Step 4 should only be locked if step 2 is not complete, since step 3 (get quote) is optional
        // In multiple mode, also requires step 3 (Select Destination Token) to be complete
        const step2Complete = sourceNetwork && sourceToken;
        if (tokenMode === 'multiple') {
            const step3DestinationComplete = destinationTokenMultiple;
            if (step2Complete && step3DestinationComplete) {
                // Don't lock step 4 if both step 2 and step 3-destination are complete
                setStep4Locked(false);
            } else {
                setStep4Locked(stepNum <= 4 || (stepNum === 5 && tokenMode === 'multiple'));
            }
        } else {
            if (step2Complete) {
                // Don't lock step 4 if step 2 is complete, even if we're on an earlier step
                setStep4Locked(false);
            } else {
                setStep4Locked(stepNum <= 4 || (stepNum === 5 && tokenMode === 'multiple'));
            }
        }
        setStep5Locked(stepNum <= 5 || (stepNum === 6 && tokenMode === 'multiple'));
    };

    // Refresh function: clears data from subsequent steps but keeps them unlocked
    // This allows smooth flow without interrupting the user with dialogs
    const refreshStepsFrom = (stepNum) => {
        if (stepNum <= 2) {
            setSourceNetwork('');
            setSourceToken('');
            setShowSourceNetworks(false);
            setShowSelectedNetworkInfo(false);
            setShowSourceTokenSelector(false);
            setOpenTokenDropdown(null);
            setNetworkMap({}); // Clear networkMap to prevent stale token data
        }
        if (stepNum <= 3) {
            setDestinationTokenMultiple('');
            setShowDestinationTokens(false);
            setShowSelectedDestTokenInfo(false);
        }
        if (stepNum <= 3 || (stepNum === 4 && tokenMode === 'multiple')) {
            // Clear quote-related state
            setQuotes([]);
            setShowQuoteDetails(false);
            setShowSwapRequestFields(false);
            setMaxAmount(null);
            setStep3Result({ message: '', variant: 'neutral', visible: false });
        }
        if (stepNum <= 4 || (stepNum === 5 && tokenMode === 'multiple')) {
            // Clear swap-related state
            setSwapId(null);
            setDepositAddress('');
            setShowDepositInfo(false);
            setShowSwapRoute(false);
            setStep4Result({ message: '', variant: 'neutral', visible: false });
        }
        if (stepNum <= 5 || (stepNum === 6 && tokenMode === 'multiple')) {
            // Clear tracking state
            if (trackingInterval) {
                clearInterval(trackingInterval);
                setTrackingInterval(null);
            }
            if (countdownInterval) {
                clearInterval(countdownInterval);
                setCountdownInterval(null);
            }
            setStep5Result({ message: '', variant: 'neutral', visible: false });
        }
        // Note: We intentionally do NOT lock steps here - that's the key difference from resetStepsFrom
        // This allows users to continue smoothly without interruption
    };

    // Refresh a step and reload its data if prerequisites are met
    const refreshStepAndReload = async (stepNum, overrides = {}, modeOverride = null) => {
        // Use modeOverride if provided (for immediate mode changes), otherwise use current tokenMode state
        const currentMode = modeOverride ?? tokenMode;
        
        // Check if step was previously loaded BEFORE clearing
        const wasStep2Loaded = stepNum === 2 && showSourceNetworks;
        const wasStep3DestinationLoaded = stepNum === 3 && currentMode === 'multiple' && showDestinationTokens;
        const wasStep3QuoteLoaded = stepNum === 3 && currentMode === 'single' && showQuoteDetails;
        
        // Use overrides if provided, otherwise fall back to state values
        const destNetwork = overrides.destinationNetwork ?? destinationNetwork;
        const destToken = overrides.destinationToken ?? destinationToken;
        
        // Clear selections
        refreshStepsFrom(stepNum);
        
        // Auto-refresh step data if prerequisites are met
        if (stepNum === 2 && wasStep2Loaded) {
            // Refresh Step 2: Get sources
            // Prerequisites: destinationNetwork is required, destinationToken only for single mode
            const hasPrerequisites = currentMode === 'multiple' 
                ? destNetwork 
                : destNetwork && destToken;
            
            if (hasPrerequisites) {
                // Auto-refresh the data with overrides and mode
                await handleGetSources({ destinationNetwork: destNetwork, destinationToken: destToken }, currentMode);
            }
        } else if (stepNum === 3) {
            if (currentMode === 'multiple' && wasStep3DestinationLoaded) {
                // For multiple mode: get destination tokens
                if (sourceNetwork && sourceToken) {
                    await handleGetDestinationTokens();
                }
            } else if (currentMode === 'single' && wasStep3QuoteLoaded) {
                // For single mode: get quote if step 3 was previously loaded
                if (sourceNetwork && sourceToken && destNetwork && destToken) {
                    await handleGetQuote();
                }
            }
        }
    };

    const updateApiSidebar = (stepNumber, type, data, status = 'success') => {
        const stepKey = stepNumber === '3-destination' ? 'step3-destination' : `step${stepNumber}`;
        setApiActivity(prev => ({
            ...prev,
            [stepKey]: {
                ...prev[stepKey],
                [type]: data
            }
        }));
        // Track the most recently updated step to prioritize it in the sidebar
        // Update immediately to trigger sidebar refresh
        if (type === 'response') {
            setLastUpdatedApiStep(stepKey);
        } else if (type === 'request') {
            // Also track requests so we show the step immediately when request is made
            setLastUpdatedApiStep(stepKey);
        }
    };


    // Generate curl command
    const generateCurlCommand = (url, method, headers, body) => {
        let curl = `curl -X ${method} \\\n  "${url}"`;
        if (headers && Object.keys(headers).length > 0) {
            Object.entries(headers).forEach(([key, value]) => {
                curl += ` \\\n  -H "${key}: ${value || ''}"`;
            });
        }
        if (body) {
            const bodyStr = JSON.stringify(body, null, 2).replace(/"/g, '\\"');
            curl += ` \\\n  -d "${bodyStr}"`;
        }
        return curl;
    };

    // Highlight text in curl command
    const highlightTextInCurl = (curlText, textToHighlight) => {
        if (!textToHighlight || !curlText.includes(textToHighlight)) {
            return curlText;
        }
        const escapedText = textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedText})`, 'g');
        const parts = curlText.split(regex);
        const result = [];
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === textToHighlight) {
                result.push(
                    <span key={`highlight-${i}`} className="bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light" style={{ display: 'inline' }}>
                        {textToHighlight}
                    </span>
                );
            } else if (parts[i]) {
                result.push(parts[i]);
            }
        }
        return <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{result}</span>;
    };

    // Reusable Copy Button Component
    const CopyButton = ({ text, className = "", size = "sm" }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = async () => {
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        };

        const baseClasses = "inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-xs font-medium text-gray-600 dark:text-gray-400 transition hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light";
        const sizeClasses = size === "sm" ? "px-3 py-1.5" : "px-3 py-2";
        const finalClasses = `${baseClasses} ${sizeClasses} ${className}`;

        return (
            <button
                onClick={handleCopy}
                className={finalClasses}
            >
                {copied ? (
                    <>
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5" /></svg></span>
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-icon lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg></span>
                        <span>Copy</span>
                    </>
                )}
            </button>
        );
    };

    // Helper function to load JSONFormatter dynamically
    const loadJSONFormatter = useCallback(() => {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof window !== 'undefined' && window.JSONFormatter) {
                resolve(window.JSONFormatter);
                return;
            }

            // Check if already loading
            if (window.__jsonFormatterLoading) {
                window.__jsonFormatterLoading.then(resolve).catch(reject);
                return;
            }

            // Load CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/json-formatter-js@2.3.4/dist/json-formatter.css';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);

            // Load JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/json-formatter-js@2.3.4/dist/json-formatter.umd.js';
            script.crossOrigin = 'anonymous';

            window.__jsonFormatterLoading = new Promise((scriptResolve, scriptReject) => {
                script.onload = () => {
                    if (window.JSONFormatter) {
                        resolve(window.JSONFormatter);
                        scriptResolve(window.JSONFormatter);
                    } else {
                        reject(new Error('JSONFormatter failed to load'));
                        scriptReject(new Error('JSONFormatter failed to load'));
                    }
                };
                script.onerror = () => {
                    reject(new Error('Failed to load JSONFormatter script'));
                    scriptReject(new Error('Failed to load JSONFormatter script'));
                };
            });

            document.head.appendChild(script);
        });
    }, []);

    // Helper function to format JSON response (same as HTML version)
    const displayJsonResponse = useCallback(async (stepKey, data, currentTheme) => {
        const jsonData = document.getElementById(`${stepKey}-json-data`);
        if (!jsonData) {
            return;
        }

        if (!data) {
            jsonData.innerHTML = '';
            return;
        }

        // Check if we already have the same content rendered
        const dataString = JSON.stringify(data);
        const existingDataAttr = jsonData.getAttribute('data-json-string');
        const existingTheme = jsonData.getAttribute('data-theme');

        // If content and theme are the same, don't re-render
        if (existingDataAttr === dataString && existingTheme === currentTheme && jsonData.children.length > 0) {
            return;
        }

        // Clear previous content
        jsonData.innerHTML = '';

        // Store current data and theme
        jsonData.setAttribute('data-json-string', dataString);
        jsonData.setAttribute('data-theme', currentTheme);

        try {
            // Try to load and use JSONFormatter
            let JSONFormatterClass = null;
            try {
                JSONFormatterClass = await loadJSONFormatter();
            } catch (error) {
                // JSONFormatter failed to load, will use fallback
            }

            if (JSONFormatterClass) {
                // Create JSON formatter with 3 levels open by default
                const formatter = new JSONFormatterClass(data, 3, {
                    theme: currentTheme === 'dark' ? 'dark' : 'light',
                    animateOpen: false,
                    animateClose: false
                });

                jsonData.appendChild(formatter.render());
            } else {
                // Fallback to simple pre formatting if JSONFormatter is not loaded
                const pre = document.createElement('pre');
                pre.className = 'm-0 font-mono whitespace-pre-wrap break-words';
                pre.style.color = currentTheme === 'dark' ? '#d4d4d4' : '#1f2937';
                pre.style.fontSize = '12px';
                pre.style.lineHeight = '1.6';
                pre.style.margin = '0';
                pre.style.whiteSpace = 'pre-wrap';
                pre.style.wordBreak = 'break-all';
                pre.textContent = JSON.stringify(data, null, 2);
                jsonData.appendChild(pre);
            }
        } catch (error) {
            // Fallback to simple pre formatting on error
            const pre = document.createElement('pre');
            pre.className = 'm-0 font-mono whitespace-pre-wrap break-words';
            pre.style.color = currentTheme === 'dark' ? '#d4d4d4' : '#1f2937';
            pre.style.fontSize = '12px';
            pre.style.lineHeight = '1.6';
            pre.style.margin = '0';
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.wordBreak = 'break-all';
            pre.textContent = JSON.stringify(data, null, 2);
            jsonData.appendChild(pre);
        }
    }, [loadJSONFormatter]);

    // Helper component for JSON response display with formatting
    // Memoized to prevent re-creation on every render
    const JsonResponseDisplay = useMemo(() => {
        return ({ data, theme, stepKey }) => {
            const dataStringRef = useRef('');
            const lastStepKeyRef = useRef('');
            const lastThemeRef = useRef('');

            useEffect(() => {
                if (!data || !stepKey) return;

                // Serialize data to string for comparison
                const dataString = JSON.stringify(data);

                // Check if element exists and already has the same content
                const jsonData = document.getElementById(`${stepKey}-json-data`);
                if (!jsonData) return;

                // Check if we need to update - compare all values
                const needsUpdate =
                    dataStringRef.current !== dataString ||
                    lastStepKeyRef.current !== stepKey ||
                    lastThemeRef.current !== theme;

                if (!needsUpdate && jsonData.children.length > 0) {
                    return;
                }

                // Update refs before rendering
                dataStringRef.current = dataString;
                lastStepKeyRef.current = stepKey;
                lastThemeRef.current = theme;

                // Use requestAnimationFrame to batch DOM updates and prevent flickering
                const rafId = requestAnimationFrame(() => {
                    const currentJsonData = document.getElementById(`${stepKey}-json-data`);
                    if (!currentJsonData) return;

                    // Double-check the data hasn't changed while we were waiting
                    const currentDataString = JSON.stringify(data);
                    if (currentDataString !== dataString ||
                        lastStepKeyRef.current !== stepKey ||
                        lastThemeRef.current !== theme) {
                        return;
                    }

                    displayJsonResponse(stepKey, data, theme);
                });

                return () => cancelAnimationFrame(rafId);
            }, [data, theme, stepKey]);

            return (
                <div className="flex-1 overflow-y-auto bg-white dark:bg-background-dark px-5 py-4 text-xs leading-relaxed text-gray-900 dark:text-gray-200">
                    <div id={`${stepKey}-json-data`} className="json-content" />
                </div>
            );
        };
    }, []); // Empty deps - component function is stable

    // Reusable Result Box Component
    const ResultBox = ({ result }) => {
        if (!result.visible) return null;

        const isErrorWithDescription = result.variant === 'error' && result.description;

        return (
            <div className={`mt-4 rounded-lg ${result.variant === 'success'
                ? ''
                : result.variant === 'error'
                    ? 'border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20'
                    : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark'
                }`}>
                {isErrorWithDescription ? (
                    <div className="flex items-start gap-3 px-4 py-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                                {result.message}
                            </div>
                            <div className="text-sm text-red-700/90 dark:text-red-400/90 leading-relaxed">
                                {result.description}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`${result.variant === 'success' ? '' : 'px-4 py-3'} text-sm leading-relaxed break-words flex items-start gap-3 ${result.variant === 'success'
                        ? `text-green-600 dark:text-green-400 ${result.dimmed ? 'opacity-50' : ''}`
                        : result.variant === 'error'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-900 dark:text-gray-200'
                        }`}>
                            {result.variant === 'error' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        )}
                        {result.variant === 'success' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        )}
                        <div className="flex-1">
                            {result.description ? (
                                <>
                                    <div className={`font-medium mb-1 ${result.variant === 'error' ? 'text-red-900 dark:text-red-300' : ''}`}>
                                        {result.message}
                                    </div>
                                    <div className={`${result.variant === 'error' ? 'text-red-700/90 dark:text-red-400/90' : 'opacity-90'}`}>
                                        {result.description}
                                    </div>
                                </>
                            ) : (
                                <div>{result.message}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Get API docs URL for a step
    const getApiDocsUrl = (stepKey) => {
        const docsMap = {
            'step2': 'https://docs.layerswap.io/api-reference/swaps/get-sources',
            'step3-destination': 'https://docs.layerswap.io/api-reference/swaps/get-destinations',
            'step3': 'https://docs.layerswap.io/api-reference/swaps/get-detailed-quote',
            'step4': 'https://docs.layerswap.io/api-reference/swaps/create-swap',
            'step5': 'https://docs.layerswap.io/api-reference/swaps/get-swap'
        };
        return docsMap[stepKey] || '';
    };

    // Check if any API activity exists
    const hasApiActivity = () => {
        return Object.values(apiActivity).some(activity => activity.request || activity.response);
    };

    // Map section ID to API step key
    const getApiSectionKey = (sectionId) => {
        if (sectionId === 'step3-destination') return 'step3-destination';
        if (sectionId === 'step2') return 'step2';
        if (sectionId === 'step3') return 'step3';
        if (sectionId === 'step4') return 'step4';
        if (sectionId === 'step5') return 'step5';
        return null;
    };

    // Check if a step has API data
    const stepHasApiData = (stepKey) => {
        if (!stepKey) return false;
        const activity = apiActivity[stepKey];
        return !!(activity?.request || activity?.response);
    };

    // API Activity Component - shows API request/response for a specific step
    // Can be used in both desktop sidebar and mobile sections
    const ApiActivityDisplay = ({ stepKey, className = "" }) => {
        if (!stepKey) return null;

        const activity = apiActivity[stepKey];
        if (!activity || (!activity.request && !activity.response)) return null;

        // Memoize response display to prevent re-rendering when highlightParam changes
        const responseDisplay = useMemo(() => {
            if (!activity.response) return null;
            return (
                <div className="flex flex-1 min-h-[200px] flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-gray-200">
                        <span>API Response</span>
                        <CopyButton
                            text={JSON.stringify(activity.response, null, 2)}
                        />
                    </div>
                    <JsonResponseDisplay data={activity.response} theme={theme} stepKey={stepKey} />
                </div>
            );
        }, [activity.response, theme, stepKey]);

        return (
            <div className={`flex flex-col gap-3 flex-1 min-h-0 ${className}`}>
                {activity.request && (
                    <>
                        <div className="flex min-h-[200px] max-h-[40%] flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark shadow-sm">
                            <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-gray-200">
                                <span>API Request</span>
                                <div className="flex items-center gap-2">
                                    <CopyButton
                                        text={generateCurlCommand(
                                            activity.request.url || `${API_BASE}${activity.request.endpoint}`,
                                            activity.request.method || 'GET',
                                            activity.request.headers || {},
                                            activity.request.body
                                        )}
                                    />
                                    {getApiDocsUrl(stepKey) && (
                                        <a
                                            href={getApiDocsUrl(stepKey)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition hover:text-primary dark:hover:text-primary-light no-underline"
                                        >
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                            </span>
                                            <span>API Docs</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-words px-5 py-4 font-mono text-xs leading-relaxed text-gray-900 dark:text-gray-200">
                                {highlightParam === 'has_deposit_address=true' && stepKey === 'step2'
                                    ? highlightTextInCurl(
                                        generateCurlCommand(
                                            activity.request.url || `${API_BASE}${activity.request.endpoint}`,
                                            activity.request.method || 'GET',
                                            activity.request.headers || {},
                                            activity.request.body
                                        ),
                                        'has_deposit_address=true'
                                    )
                                    : generateCurlCommand(
                                        activity.request.url || `${API_BASE}${activity.request.endpoint}`,
                                        activity.request.method || 'GET',
                                        activity.request.headers || {},
                                        activity.request.body
                                    )}
                            </div>
                        </div>
                        {stepKey === 'step2' && (
                            <div className="api-hint flex items-start gap-2 rounded-2xl border border-slate-200/60 bg-surface-soft px-3 py-2 text-xs leading-relaxed text-ink-soft dark:border-white/10 dark:bg-surface-dark-soft dark:text-ink-invert-soft">
                                <span className="text-sm text-primary dark:text-primary-light flex-shrink-0 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                </span>
                                <span>The <code 
                                    className="rounded bg-primary/10 dark:bg-primary-light/10 px-1 py-0.5 font-mono text-[11px] text-primary dark:text-primary-light cursor-pointer hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors"
                                    onClick={() => setHighlightParam(highlightParam === 'has_deposit_address=true' ? null : 'has_deposit_address=true')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setHighlightParam(highlightParam === 'has_deposit_address=true' ? null : 'has_deposit_address=true');
                                        }
                                    }}
                                >has_deposit_address=true</code> parameter ensures we only show sources that support generating deposit addresses, which is essential for the deposit flow.</span>
                            </div>
                        )}
                    </>
                )}

                {responseDisplay}
            </div>
        );
    };

    // Get active step key for API sidebar based on current active section
    const getActiveApiStepKey = useMemo(() => {
        const API_SECTION_ORDER = ['step2', 'step3-destination', 'step3', 'step4', 'step5'];
        const currentKey = getApiSectionKey(activeSection);

        // Priority 1: If current section has data, show it
        if (currentKey && stepHasApiData(currentKey)) {
            return currentKey;
        }

        // Priority 2: If there's a recently updated step with data, show it immediately
        // (but only if we haven't scrolled past it)
        if (lastUpdatedApiStep && stepHasApiData(lastUpdatedApiStep)) {
            const lastUpdatedIndex = API_SECTION_ORDER.indexOf(lastUpdatedApiStep);
            const currentIndex = currentKey ? API_SECTION_ORDER.indexOf(currentKey) : -1;
            // Show if: we're on overview/step1, or we're on/behind the updated step
            if (lastUpdatedIndex >= 0 && (currentIndex < 0 || lastUpdatedIndex >= currentIndex)) {
                return lastUpdatedApiStep;
            }
        }

        // Priority 3: Find the next section with data
        if (currentKey) {
            const currentIndex = API_SECTION_ORDER.indexOf(currentKey);
            if (currentIndex >= 0) {
                // Look forward first
                for (let i = currentIndex + 1; i < API_SECTION_ORDER.length; i++) {
                    const nextKey = API_SECTION_ORDER[i];
                    if (stepHasApiData(nextKey)) {
                        return nextKey;
                    }
                }
                // Look backward
                for (let i = currentIndex - 1; i >= 0; i--) {
                    const prevKey = API_SECTION_ORDER[i];
                    if (stepHasApiData(prevKey)) {
                        return prevKey;
                    }
                }
            }
        }

        // Priority 4: Fallback to most recently updated step
        if (lastUpdatedApiStep && stepHasApiData(lastUpdatedApiStep)) {
            return lastUpdatedApiStep;
        }

        // Priority 5: Find first step with data
        for (const stepKey of API_SECTION_ORDER) {
            if (stepHasApiData(stepKey)) {
                return stepKey;
            }
        }

        return null;
    }, [activeSection, apiActivity, lastUpdatedApiStep]);


    // Validation check for enabling steps
    useEffect(() => {
        const apiKeyValidation = validateApiKey(apiKey);
        const walletValidation = validateWalletAddress(walletAddress);
        const isValid = tokenMode === 'single'
            ? apiKeyValidation.valid && walletValidation.valid && destinationNetwork && destinationToken
            : apiKeyValidation.valid && walletValidation.valid && destinationNetwork;

        if (isValid) {
            setStep2Locked(false);
        } else {
            setStep2Locked(true);
        }
    }, [apiKey, walletAddress, destinationNetwork, destinationToken, tokenMode]);

    // Unlock step 4 (Create Swap) when step 2 (Select Source) is completed
    // Getting a quote is optional, so step 4 should be unlocked based on step 2 completion
    // In multiple mode, also requires step 3 (Select Destination Token) to be completed
    useEffect(() => {
        const step2Complete = sourceNetwork && sourceToken;
        if (tokenMode === 'multiple') {
            const step3DestinationComplete = destinationTokenMultiple;
            if (step2Complete && step3DestinationComplete) {
                setStep4Locked(false);
            }
        } else {
            if (step2Complete) {
                setStep4Locked(false);
            }
        }
    }, [sourceNetwork, sourceToken, destinationTokenMultiple, tokenMode]);

    // Get selected network display name
    const selectedNetworkDisplay = networks.find(n => n.name === destinationNetwork)?.display_name || formatNetworkName(destinationNetwork);

    // Get selected network tokens
    const selectedNetworkTokens = networks.find(n => n.name === destinationNetwork)?.tokens || [];

    // Featured networks
    const featuredNetworks = useMemo(() => {
        return networks.filter(n => FEATURED_NETWORKS.includes(n.name));
    }, [networks]);

    // Regular networks (non-featured)
    const regularNetworks = useMemo(() => {
        return networks.filter(n => !FEATURED_NETWORKS.includes(n.name));
    }, [networks]);

    const handleNavClick = (sectionId, e) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 96;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'step1', label: 'Step 1: Setup Destination' },
        { id: 'step2', label: 'Step 2: Select Source' },
        ...(tokenMode === 'multiple' ? [{ id: 'step3-destination', label: 'Step 3: Select Destination Token' }] : []),
        { id: 'step3', label: `${tokenMode === 'multiple' ? 'Step 4:' : 'Step 3:'} Get Quote` },
        { id: 'step4', label: `${tokenMode === 'multiple' ? 'Step 5:' : 'Step 4:'} Create Swap` },
        { id: 'step5', label: `${tokenMode === 'multiple' ? 'Step 6:' : 'Step 5:'} Check Status` }
    ];

    const isStepLocked = (sectionId) => {
        // Overview and Step 1 are always accessible
        if (sectionId === 'overview' || sectionId === 'step1') {
            return false;
        }
        
        // Step 2 requires Step 1 to be completed (destination network, token, and wallet address)
        // In multiple mode, only destination network is required (token is selected in step3-destination)
        if (sectionId === 'step2') {
            const walletValidation = validateWalletAddress(walletAddress);
            const step1Complete = destinationNetwork && 
                (tokenMode === 'single' ? destinationToken : true) &&
                walletValidation.valid;
            return !step1Complete;
        }
        
        // Step 3-destination (multiple mode only) requires Step 2 to be completed
        if (sectionId === 'step3-destination') {
            const step2Complete = sourceNetwork && sourceToken;
            return !step2Complete;
        }
        
        // Step 3 (Get Quote) requires Step 2 to be completed
        if (sectionId === 'step3') {
            const step2Complete = sourceNetwork && sourceToken;
            return !step2Complete;
        }
        
        // Step 4 (Create Swap) requires Step 2 to be completed (get quote is optional)
        // In multiple mode, also requires Step 3 (Select Destination Token) to be completed
        if (sectionId === 'step4') {
            const step2Complete = sourceNetwork && sourceToken;
            if (tokenMode === 'multiple') {
                const step3DestinationComplete = destinationTokenMultiple;
                return !step2Complete || !step3DestinationComplete;
            }
            return !step2Complete;
        }
        
        // Step 5 (Check Status) requires Step 4 to be completed (swap created)
        if (sectionId === 'step5') {
            const step4Complete = swapId !== null;
            return !step4Complete;
        }
        
        return false;
    };

    // Helper function to get the prerequisite step name
    const getPrerequisiteStep = (sectionId) => {
        if (sectionId === 'step2') return 'Step 1: Setup Destination';
        if (sectionId === 'step3-destination') return 'Step 2: Select Source';
        if (sectionId === 'step3') return 'Step 2: Select Source';
        if (sectionId === 'step4') return tokenMode === 'multiple' ? 'Step 3: Select Destination Token' : 'Step 2: Select Source';
        if (sectionId === 'step5') return tokenMode === 'multiple' ? 'Step 5: Create Swap' : 'Step 4: Create Swap';
        return '';
    };

    // Generic function to handle step changes with automatic refresh
    const handleStepChange = async (stepNum, newValue, setter, additionalActions = null) => {
        const completedSteps = getCompletedSteps();
        
        // Find all steps that come after this step
        const stepsAfterCurrent = completedSteps.filter(step => {
            const stepNumAfter = getStepNumber(step);
            return stepNumAfter > stepNum;
        });
        
        // Apply the change
        setter(newValue);
        if (additionalActions) {
            additionalActions();
        }
        
        // If there are completed steps after this, refresh them (clear selections and reload if prerequisites met)
        if (stepsAfterCurrent.length > 0) {
            await refreshStepAndReload(stepNum + 1);
        }
    };

    const h1Styles = "inline-block text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight dark:text-gray-200";
    const h2h3Styles = "flex whitespace-pre-wrap group font-semibold";

    const integrationFlowSteps = [
        {
            id: 1,
            title: 'Set Your Destination',
            description: 'Configure your wallet address and specify which network and token you want to receive (e.g., USDC on Base, ETH on Arbitrum).'
        },
        {
            id: 2,
            title: 'Fetch Available Sources',
            description: 'Call GET /sources endpoint – returns all networks and tokens your users can send from to reach your destination (70+ options).'
        },
        {
            id: 3,
            title: 'User Selects Source',
            description: 'Call POST /swaps with the selected route – the API creates a unique deposit address and handles all bridging logic.'
        },
        {
            id: 4,
            title: 'Display to User',
            description: 'Show the deposit address with clear instructions so the user sends from the source network they selected.'
        },
        {
            id: 5,
            title: 'Receive Funds',
            description: 'User sends tokens → Layerswap detects the deposit → automatically converts and bridges → delivers to your wallet on the destination network (usually ~10s).'
        }
    ];

    // ===== REUSABLE DROPDOWN COMPONENT =====
    // Memoized to prevent re-creation on every render
    const ReusableDropdown = useMemo(() => {
        return ({
            label,
            selectedValue,
            selectedDisplay,
            placeholder,
            isOpen,
            onToggle,
            onSelect,
            searchTerm,
            onSearchChange,
            searchPlaceholder,
            items,
            featuredItems = [],
            getItemKey,
            getItemDisplay,
            getItemImage,
            getItemValue,
            showFeaturedSection = false,
            dropdownRef,
            onItemSelect
        }) => {
            const searchInputRef = useRef(null);

            useEffect(() => {
                if (isOpen && onSearchChange && searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, [isOpen, onSearchChange]);

        const filteredItems = useMemo(() => {
            if (!searchTerm) return items;
            const search = searchTerm.toLowerCase();
            return items.filter(item => {
                const display = getItemDisplay(item);
                return display.toLowerCase().includes(search);
            });
        }, [items, searchTerm, getItemDisplay]);

        const filteredFeaturedItems = useMemo(() => {
            if (!searchTerm || !showFeaturedSection) return featuredItems;
            const search = searchTerm.toLowerCase();
            return featuredItems.filter(item => {
                const display = getItemDisplay(item);
                return display.toLowerCase().includes(search);
            });
        }, [featuredItems, searchTerm, showFeaturedSection, getItemDisplay]);

        const handleItemClick = (item) => {
            const value = getItemValue(item);
            if (onItemSelect) {
                onItemSelect(item, value);
            } else if (onSelect) {
                onSelect(value);
            }
            onToggle(false);
            if (onSearchChange) {
                onSearchChange('');
            }
        };

        return (
            <div className="relative flex flex-col gap-2 w-full" ref={dropdownRef}>
                {label && (
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {label}
                    </label>
                )}
                <div
                    onClick={() => onToggle(!isOpen)}
                    className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors hover:border-primary dark:hover:border-primary-light"
                >
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap pr-3">
                        {selectedDisplay || placeholder || 'Select...'}
                    </span>
                    <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        className={`flex-shrink-0 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    >
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                {isOpen && (
                    <div className="absolute left-0 right-0 top-full z-40 mt-2 flex max-h-[400px] w-full max-w-[448px] flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark shadow-lg">
                        {onSearchChange && (
                            <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-3">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm || ''}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder={searchPlaceholder || 'Search...'}
                                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none transition-colors focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30"
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <div className="max-h-[350px] overflow-y-auto py-2">
                            {showFeaturedSection && filteredFeaturedItems.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-4 pb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        Featured Networks
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {filteredFeaturedItems.map(item => {
                                            const key = getItemKey(item);
                                            const display = getItemDisplay(item);
                                            const image = getItemImage ? getItemImage(item) : null;
                                            const value = getItemValue(item);
                                            const isSelected = selectedValue === value;
                                            return (
                                                <div
                                                    key={key}
                                                    onClick={() => handleItemClick(item)}
                                                    className={`flex items-center gap-3 rounded-lg px-4 py-2 h-10 text-sm transition-all ${isSelected
                                                        ? 'bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light'
                                                        : 'text-gray-900 dark:text-gray-200 hover:bg-gray-600/5 dark:hover:bg-gray-200/5'
                                                        }`}
                                                >
                                                    {image && (
                                                        <img
                                                            src={image}
                                                            alt={display}
                                                            className="h-6 w-6 rounded-full object-contain"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                    )}
                                                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {display}
                                                    </span>
                                                    {showFeaturedSection && <span className="text-xs" style={{ color: '#fbbf24' }}>★</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div>
                                {showFeaturedSection && filteredItems.length > 0 && (
                                    <div className="px-4 pb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        All Networks
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    {filteredItems.map(item => {
                                        const key = getItemKey(item);
                                        const display = getItemDisplay(item);
                                        const image = getItemImage ? getItemImage(item) : null;
                                        const value = getItemValue(item);
                                        const isSelected = selectedValue === value;
                                        return (
                                            <div
                                                key={key}
                                                onClick={() => handleItemClick(item)}
                                                className={`flex items-center gap-3 rounded-lg px-4 py-2 h-10 text-sm transition-all ${isSelected
                                                    ? 'bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light'
                                                    : 'text-gray-900 dark:text-gray-200 hover:bg-gray-600/5 dark:hover:bg-gray-200/5'
                                                    }`}
                                            >
                                                {image && (
                                                    <img
                                                        src={image}
                                                        alt={display}
                                                        className="h-6 w-6 rounded-full object-contain"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                )}
                                                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {display}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
        };
    }, []);

    // Phase 1 – Layout, navigation, header, overview section (Tailwind-assisted)
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.7);
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.3);
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
                }
                .dark .custom-scrollbar {
                    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
                }
            `}} />
        <div className="max-w-8xl lg:flex mx-auto px-0 lg:px-5"  >
            {/* Desktop Navigation Sidebar */}
            {windowWidth >= 768 && (
                <nav id="sidebar-content" className="hidden sticky shrink-0 w-[18rem] lg:flex flex-col left-0 top-[6rem] bottom-0 right-auto border-r border-gray-100 dark:border-white/10 transition-transform duration-100 h-[95dvh]">
                    <div id="navigation-items" className="flex-1 pr-5 pt-5 pb-4 overflow-y-auto stable-scrollbar-gutter">
                        <div className="text-sm relative">
                            <div>
                                <div className="sidebar-group-header flex items-center gap-2.5 pl-4 mb-3.5 lg:mb-2.5 font-semibold text-gray-700 dark:text-gray-300 text-xs">
                                    <h5 id="sidebar-title">
                                        Documentation
                                    </h5>
                                </div>
                                <ul
                                    className="space-y-px"
                                    id="sidebar-group"
                                >
                                    {navItems.map(item => {
                                        const active = activeSection === item.id;
                                        return (
                                            <li className="relative scroll-m-4 first:scroll-m-20" key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    onClick={(e) => handleNavClick(item.id, e)}
                                                    className={`group flex items-center pr-3 pl-4 py-1.5 cursor-pointer gap-x-3 text-left rounded-xl w-full outline-offset-[-1px] ${active
                                                        ? 'bg-primary/10 text-primary [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor] dark:text-primary-light dark:bg-primary-light/10'
                                                        : 'hover:bg-gray-600/5 dark:hover:bg-gray-200/5 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex-1 flex items-center space-x-2.5">
                                                        <div>{item.label}</div>
                                                    </div>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <div className="w-full">
                <div className="px-5 lg:pr-10 lg:pl-[3.25rem] lg:pt-10 mx-auto max-w-6xl flex flex-row-reverse gap-x-12 w-full pt-8 sm:pt-36" style={{ gap: '48px' }}>
                    <div className="hidden xl:flex self-start sticky xl:flex-col max-w-[28rem] w-full top-[calc(9.5rem-var(--sidenav-move-up,0px))] overflow-x-hidden" style={{ height: 'calc(100vh - 10rem)' }}>
                        {/* API Sidebar */}
                        {windowWidth >= 1024 && (
                            <>
                                <aside className="left-[calc(50vw+240px)] top-[140px] z-10 flex w-[416px] flex-shrink-0 flex-col gap-6 border-l border-gray-200 dark:border-white/10 pl-6 h-full" style={{ background: 'unset' }}>
                                    <div className="flex flex-col gap-4 flex-1 min-h-0">
                                        {!hasApiActivity() ? (
                                            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-5 py-8 text-center text-sm text-gray-600 dark:text-gray-400 shadow-sm">
                                                <span className="mb-3 text-lg text-primary dark:text-primary-light">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-branch-icon lucide-git-branch"><line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
                                                </span>
                                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                    Run an API step to see live requests and responses here.
                                                </p>
                                            </div>
                                        ) : (
                                            <ApiActivityDisplay stepKey={getActiveApiStepKey} />
                                        )}
                                    </div>
                                </aside>
                            </>
                        )}
                    </div>
                    <div className="grow w-full mx-auto xl:w-[calc(100%-28rem)]">
                        {/* Header */}
                        <header id="header" className="realtive">
                            <div className="mt-0.5 space-y-2.5">
                                <div className="eyebrow h-5 text-primary dark:text-primary-light text-sm font-semibold">
                                    Documentation
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center relative gap-2">
                                    <h1 id="page-title" className={h1Styles}>
                                        Layerswap Deposit API Tutorial
                                    </h1>
                                </div>
                                <div className="mt-2 text-lg prose prose-gray dark:prose-invert [&>*]:[overflow-wrap:anywhere]">
                                    <p>
                                        Interactive guide to integrate cross-chain deposits into your wallet or application.
                                    </p>
                                </div>
                            </div>
                        </header>
                        <div className="mdx-content relative mt-8 mb-14 prose prose-gray dark:prose-invert">
                            {/* Overview Section */}
                            <div id="overview" className="mb-6">
                                <h2 className={h2h3Styles} >
                                    Accept Deposits from Any Chain, Instantly
                                </h2>
                                <p>
                                    Give users a single deposit address. They send from any chain – funds automatically bridge and arrive to your destination. That's it.
                                </p>

                                {/* Stats Cards */}
                                <div
                                    className="mt-6 grid gap-4"
                                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
                                >
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-6 py-5 text-center">
                                        <span className="text-3xl font-semibold text-gray-900 dark:text-gray-200">
                                            70+
                                        </span>
                                        <span className="mt-1 text-xs uppercase text-gray-600 dark:text-gray-400">
                                            Networks
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-6 py-5 text-center">
                                        <span className="text-3xl font-semibold text-gray-900 dark:text-gray-200">
                                            &lt;10s
                                        </span>
                                        <span className="mt-1 text-xs uppercase text-gray-600 dark:text-gray-400">
                                            Processing
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-6 py-5 text-center">
                                        <span className="text-3xl font-semibold text-gray-900 dark:text-gray-200">
                                            $1B+
                                        </span>
                                        <span className="mt-1 text-xs uppercase text-gray-600 dark:text-gray-400">
                                            Volume
                                        </span>
                                    </div>
                                </div>

                                {/* Integration Flow */}
                                <div className="">
                                    <h3 className={h2h3Styles}>
                                        Integration Flow
                                    </h3>

                                    <div className="mt-8 flex flex-col gap-3">
                                        {integrationFlowSteps.map(step => (
                                            <div key={step.id} className="flex items-start gap-4 pb-5">
                                                <div className="flex flex-col items-center pt-1">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-900 shadow-sm dark:border-white/10 dark:bg-background-dark dark:text-gray-100">
                                                        {step.id}
                                                    </div>
                                                    <div className="mt-2 h-full w-px bg-gray-200 dark:bg-white/10"></div>
                                                </div>
                                                <div className="flex flex-1 flex-col gap-1.5">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</p>
                                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile-Friendly Note */}
                                <div className="flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-5 py-4 text-sm">
                                    <div className="mt-1 text-lg text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smartphone-icon lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm font-semibold uppercase text-gray-900 dark:text-gray-200">
                                            No Wallet Connections Required
                                        </div>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            Just a simple deposit address—no WalletConnect, no browser extensions, no popups. Users can send from any wallet app (MetaMask, Trust Wallet, exchange wallets, hardware wallets) using their preferred method. Perfect for mobile users.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mt-3 h-px bg-gray-200 dark:bg-white/10 opacity-0"></div>

                            {/* Configuration Section */}
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200" style={{ margin: 0 }}>
                                        Configuration
                                    </h2>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        Set up your API credentials to get started.
                                    </p>
                                </div>

                                <div
                                    className="grid gap-4"
                                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
                                >
                                    {/* Base API URL */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                            Base API URL
                                        </label>
                                        <input
                                            type="text"
                                            value={API_BASE}
                                            disabled
                                            className="w-full cursor-not-allowed rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm opacity-60 text-gray-900 dark:text-gray-200"
                                            style={{ backgroundColor: 'unset', background: 'unset' }}
                                        />
                                    </div>

                                    {/* API Key */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                            API Key <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={apiKey}
                                            onChange={handleApiKeyChange}
                                            placeholder="Optional - for higher rate limits & analytics"
                                            aria-label="API Key"
                                            className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors text-gray-900 dark:text-gray-200 bg-white dark:bg-background-dark ${apiKeyError ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30' : 'border-gray-200 dark:border-white/10 focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30'
                                                }`}
                                            onBlur={(e) => {
                                                if (!apiKeyError) {
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                        />
                                        {apiKeyError && (
                                            <div className="mt-1 text-xs text-destructive">
                                                {apiKeyError}
                                            </div>
                                        )}
                                        <small className="mt-1 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                            No API key needed for basic usage. Get one at{' '}
                                            <a
                                                href="https://www.layerswap.io/dashboard"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition hover:underline text-primary dark:text-primary-light"
                                            >
                                                layerswap.io/dashboard
                                            </a>
                                            {' '}for higher rate limits and analytics.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mt-12 mb-6 h-px bg-gray-200 dark:bg-white/10"></div>

                            {/* Steps Container */}
                            <div className="flex flex-col gap-12">
                                {/* Step 1: Setup Destination */}
                                <div
                                    id="step1"
                                    ref={step1Ref}
                                    className="relative flex flex-col gap-8"
                                style={{
                                    scrollMarginTop: '96px',
                                    opacity: 1
                                }}
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2" style={{ gap: '8px' }}>
                                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-200" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-900 shadow-sm dark:border-white/10 dark:bg-background-dark dark:text-gray-100">1</span>
                                            Setup Destination
                                        </h2>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            Configure your destination wallet and select the appropriate integration mode for your use case.
                                        </p>
                                    </div>

                                    {/* Mode Selector */}
                                        <div className="flex flex-col gap-4 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                                         <span className="block text-sm font-semibold text-gray-900 dark:text-gray-200">
                                            Select Your Use Case:
                                        </span>
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <div className="relative mt-0.5 flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="tokenMode"
                                                        value="single"
                                                        checked={tokenMode === 'single'}
                                                        onChange={handleModeChange}
                                                        className={`w-4 h-4 border-2 rounded-full appearance-none cursor-pointer transition-colors ${
                                                            tokenMode === 'single'
                                                                ? 'border-primary dark:border-primary-light'
                                                                : 'border-gray-300 dark:border-gray-600'
                                                        }`}
                                                    />
                                                    {tokenMode === 'single' && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="w-2 h-2 rounded-full bg-primary dark:bg-primary-light" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-base font-semibold transition-colors ${
                                                        tokenMode === 'single'
                                                            ? 'text-primary dark:text-primary-light'
                                                            : 'text-gray-900 dark:text-gray-200'
                                                    }`}>
                                                        Fixed Destination Token
                                                    </span>
                                                    <span className="text-sm leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                                                        <strong className="font-semibold">DApp Integration:</strong> For prediction markets, DEXs, or apps requiring a specific token (e.g., only USDC)
                                                    </span>
                                                </div>
                                            </label>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <div className="relative mt-0.5 flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="tokenMode"
                                                        value="multiple"
                                                        checked={tokenMode === 'multiple'}
                                                        onChange={handleModeChange}
                                                        className={`w-4 h-4 border-2 rounded-full appearance-none cursor-pointer transition-colors ${
                                                            tokenMode === 'multiple'
                                                                ? 'border-primary dark:border-primary-light'
                                                                : 'border-gray-300 dark:border-gray-600'
                                                        }`}
                                                    />
                                                    {tokenMode === 'multiple' && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="w-2 h-2 rounded-full bg-primary dark:bg-primary-light" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-base font-semibold transition-colors ${
                                                        tokenMode === 'multiple'
                                                            ? 'text-primary dark:text-primary-light'
                                                            : 'text-gray-900 dark:text-gray-200'
                                                    }`}>
                                                        Multiple Destination Tokens
                                                    </span>
                                                    <span className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold">Wallet Integration:</strong> Accept various tokens and deliver their respective counterparts on your network
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Destination Fields */}
                                    <div
                                        className="flex flex-col gap-4"
                                    >
                                        {/* Destination Networks Grid */}
                                        {networks.length > 0 && (() => {
                                            // Filter networks based on search term (prioritize startsWith, then includes)
                                            const filteredDestNetworks = networkSearchTerm
                                                ? (() => {
                                                    const search = networkSearchTerm.toLowerCase().trim();
                                                    const startsWithMatches = [];
                                                    const includesMatches = [];
                                                    
                                                    networks.forEach(network => {
                                                        const displayName = (network.display_name || formatNetworkName(network.name))?.toLowerCase() || '';
                                                        const name = network.name?.toLowerCase() || '';
                                                        const startsWith = displayName.startsWith(search) || name.startsWith(search);
                                                        const includes = displayName.includes(search) || name.includes(search);
                                                        
                                                        if (startsWith) {
                                                            startsWithMatches.push(network);
                                                        } else if (includes) {
                                                            includesMatches.push(network);
                                                        }
                                                    });
                                                    
                                                    // Prioritize startsWith matches, then includes matches
                                                    return [...startsWithMatches, ...includesMatches];
                                                })()
                                                : networks;
                                            
                                            const featuredDestNetworks = filteredDestNetworks.filter(n => FEATURED_NETWORKS.includes(n.name));
                                            const otherDestNetworks = filteredDestNetworks.filter(n => !FEATURED_NETWORKS.includes(n.name));

                                            const minNetworksToShow = 9;
                                            // When searching, preserve search priority (startsWith first, then includes)
                                            // When not searching, use featured/other split
                                            const allDestNetworks = networkSearchTerm 
                                                ? filteredDestNetworks  // Preserve search priority order
                                                : [...featuredDestNetworks, ...otherDestNetworks];  // Featured first when not searching

                                            // Use pagination logic - when searching, preserve search priority; when not searching, use featured/other split
                                            let displayedDestNetworks;
                                            if (showAllDestinationNetworks) {
                                                displayedDestNetworks = allDestNetworks;
                                            } else if (networkSearchTerm) {
                                                // When searching, use allDestNetworks directly with pagination (preserves search priority)
                                                displayedDestNetworks = allDestNetworks.slice(0, minNetworksToShow);
                                                
                                                // Ensure selected network is always visible when collapsed
                                                if (destinationNetwork) {
                                                    const selectedNetwork = allDestNetworks.find(n => n.name === destinationNetwork);
                                                    if (selectedNetwork && !displayedDestNetworks.some(n => n.name === destinationNetwork)) {
                                                        // Remove last item and add selected network
                                                        displayedDestNetworks = [
                                                            ...allDestNetworks.slice(0, minNetworksToShow - 1),
                                                            selectedNetwork
                                                        ];
                                                    }
                                                }
                                            } else {
                                                // When not searching, show featured networks + enough other networks to fill at least 3 rows
                                                const featuredCount = featuredDestNetworks.length;
                                                
                                                // Ensure selected network is always visible when collapsed (if it's from extended list)
                                                if (destinationNetwork) {
                                                    const selectedNetwork = allDestNetworks.find(n => n.name === destinationNetwork);
                                                    const isSelectedInFeatured = selectedNetwork && featuredDestNetworks.some(n => n.name === destinationNetwork);
                                                    
                                                    if (selectedNetwork && !isSelectedInFeatured) {
                                                        // Selected network is from extended list - include it in the first 9, but keep total at exactly 9
                                                        // Reduce featured networks by 1 to make room for the selected network
                                                        const featuredToShow = featuredDestNetworks.slice(0, Math.min(featuredCount, minNetworksToShow - 1));
                                                        const remainingSlots = minNetworksToShow - featuredToShow.length - 1; // -1 for selected network
                                                        const otherNetworksWithoutSelected = otherDestNetworks.filter(n => n.name !== destinationNetwork);
                                                        const otherNetworksToInclude = otherNetworksWithoutSelected.slice(0, Math.max(0, remainingSlots));
                                                        // Insert selected network after featured networks, before other networks
                                                        // Total will be: featuredToShow.length + 1 (selected) + otherNetworksToInclude.length = exactly 9
                                                        displayedDestNetworks = [
                                                            ...featuredToShow,
                                                            selectedNetwork,
                                                            ...otherNetworksToInclude
                                                        ];
                                                    } else {
                                                        // Selected network is in featured or not selected - show normal featured + others
                                                        const neededFromOthers = Math.max(0, minNetworksToShow - featuredCount);
                                                        const otherNetworksToShow = otherDestNetworks.slice(0, neededFromOthers);
                                                        displayedDestNetworks = [...featuredDestNetworks, ...otherNetworksToShow];
                                                    }
                                                } else {
                                                    // No network selected - show normal featured + others
                                                    const neededFromOthers = Math.max(0, minNetworksToShow - featuredCount);
                                                    const otherNetworksToShow = otherDestNetworks.slice(0, neededFromOthers);
                                                    displayedDestNetworks = [...featuredDestNetworks, ...otherNetworksToShow];
                                                }
                                            }

                                            // Calculate if there would be more networks when collapsed (for showing the toggle button)
                                            const hasMoreDestNetworks = networkSearchTerm
                                                ? allDestNetworks.length > displayedDestNetworks.length  // When searching, check if there are more than displayed
                                                : (() => {
                                                    // When not searching, use featured/other logic
                                                    const featuredCount = featuredDestNetworks.length;
                                                    const neededFromOthers = Math.max(0, minNetworksToShow - featuredCount);
                                                    const collapsedCount = featuredCount + Math.min(otherDestNetworks.length, neededFromOthers);
                                                    return allDestNetworks.length > collapsedCount;
                                                })();

                                            return (
                                                <div className="mt-4 flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                        Destination Network <span className="text-primary dark:text-primary-light">*</span>
                                                        {tokenMode === 'single' && ' / Token'}
                                                    </label>
                                                    {/* Search Bar */}
                                                    <div className="mb-2">
                                                        <input
                                                            type="text"
                                                            value={networkSearchTerm}
                                                            onChange={(e) => setNetworkSearchTerm(e.target.value)}
                                                            placeholder="Search networks..."
                                                            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none transition-colors focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30"
                                                        />
                                                    </div>
                                                    <div
                                                        className="grid gap-3 relative"
                                                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}
                                                    >
                                                        {displayedDestNetworks.map((network) => {
                                                            const shortName = (network.display_name || formatNetworkName(network.name))
                                                                .replace(/_MAINNET/g, '')
                                                                .replace(/_SEPOLIA/g, ' Sep')
                                                                .replace(/_/g, ' ');
                                                            const isNetworkSelected = destinationNetwork === network.name;
                                                            const hasSelectedToken = isNetworkSelected && destinationToken;
                                                            const isDropdownOpen = openDestinationTokenDropdown === network.name;
                                                            const networkTokens = network.tokens || [];
                                                            const tokenSymbols = networkTokens.map(t => t.symbol || t.asset || t);
                                                            const tokenPreview = tokenSymbols.slice(0, 3).join(', ') + (tokenSymbols.length > 3 ? '...' : '');

                                                            // In single token mode, we don't need dropdown - just select first token
                                                            const isSingleTokenMode = tokenMode === 'single';
                                                            const firstToken = networkTokens.length > 0 ? networkTokens[0] : null;
                                                            const firstTokenSymbol = firstToken ? (firstToken.symbol || firstToken.asset || firstToken) : null;

                                                            // Handle card click - select network and open dropdown if not already selected
                                                            const handleCardClick = (e) => {
                                                                e.stopPropagation();
                                                                if (!isNetworkSelected) {
                                                                    // If only one token, auto-select
                                                                    if (networkTokens.length === 1) {
                                                                        if (firstTokenSymbol) {
                                                                            handleDestinationNetworkChange(network.name, networkTokens);
                                                                            if (isSingleTokenMode) {
                                                                                handleDestinationTokenChange(firstTokenSymbol);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        // Multiple tokens - show dropdown
                                                                        handleDestinationNetworkChange(network.name, networkTokens);
                                                                        setOpenDestinationTokenDropdown(network.name);
                                                                        setDestinationTokenDropdownSearchTerm(''); // Clear search when opening dropdown
                                                                    }
                                                                }
                                                            };

                                                            // Handle token area click - open dropdown
                                                            const handleTokenAreaClick = (e) => {
                                                                e.stopPropagation();
                                                                
                                                                // If only one token, auto-select it
                                                                if (networkTokens.length === 1) {
                                                                    if (firstTokenSymbol) {
                                                                        handleDestinationNetworkChange(network.name, networkTokens);
                                                                        if (isSingleTokenMode) {
                                                                            handleDestinationTokenChange(firstTokenSymbol);
                                                                        }
                                                                    }
                                                                    return;
                                                                }
                                                                
                                                                if (!isNetworkSelected) {
                                                                    // Select network first
                                                                    handleDestinationNetworkChange(network.name, networkTokens);
                                                                }
                                                                if (isDropdownOpen) {
                                                                    setOpenDestinationTokenDropdown(null);
                                                                    setDestinationTokenDropdownSearchTerm(''); // Clear search when closing dropdown
                                                                } else {
                                                                    setOpenDestinationTokenDropdown(network.name);
                                                                }
                                                            };

                                                            // Handle token selection from dropdown
                                                            const handleTokenSelect = (token, e) => {
                                                                e.stopPropagation();
                                                                const tokenSymbol = token.symbol || token.asset || token;
                                                                handleDestinationNetworkChange(network.name, networkTokens);
                                                                if (isSingleTokenMode) {
                                                                    handleDestinationTokenChange(tokenSymbol);
                                                                }
                                                                setOpenDestinationTokenDropdown(null);
                                                                setDestinationTokenDropdownSearchTerm(''); // Clear search when token is selected
                                                            };

                                                            return (
                                                                <div
                                                                    key={network.name}
                                                                    data-destination-card
                                                                    data-network-name={network.name}
                                                                    className={`relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all cursor-pointer ${isNetworkSelected
                                                                        ? 'border-primary dark:border-primary-light'
                                                                        : 'border-gray-200 bg-white dark:bg-background-dark hover:border-primary/50 dark:hover:border-primary-light/50'
                                                                        }`}
                                                                    style={!isNetworkSelected ? { borderColor: theme === 'dark' ? 'rgba(20, 26, 39, 1)' : undefined } : undefined}
                                                                    onClick={handleCardClick}
                                                                >
                                                                    {/* Network Info */}
                                                                    <div className="flex flex-col gap-2 pl-1">
                                                                        {network.logo && (
                                                                            <img
                                                                                src={network.logo}
                                                                                alt={shortName}
                                                                                className="h-8 w-8 rounded-full object-contain bg-gray-100 dark:bg-gray-800 p-0.5"
                                                                                style={{ margin: 0 }}
                                                                                onError={(e) => e.target.style.display = 'none'}
                                                                            />
                                                                        )}
                                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                            {shortName}
                                                                        </span>
                                                                    </div>

                                                                    {/* Token Area */}
                                                                    <div
                                                                        className={`flex items-center justify-between rounded-lg bg-gray-100 p-2 transition-colors ${
                                                                            isSingleTokenMode ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800/50' : 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800/50'
                                                                        }`}
                                                                        style={theme === 'dark' ? { backgroundColor: 'rgba(20, 26, 39, 0.5)' } : {}}
                                                                        onClick={handleTokenAreaClick}
                                                                    >
                                                                        {isSingleTokenMode ? (
                                                                            // Single token mode: show token preview (like sources in multiple mode)
                                                                            !isNetworkSelected ? (
                                                                                // Default state: show token preview
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                                    {tokenPreview || 'No tokens'}
                                                                                </span>
                                                                            ) : hasSelectedToken ? (
                                                                                // Selected state with token: show selected token
                                                                                <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                                                                                    {destinationToken}
                                                                                </span>
                                                                            ) : (
                                                                                // Selected state without token: show "Select Token"
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                    Select Token
                                                                                </span>
                                                                            )
                                                                        ) : !isNetworkSelected ? (
                                                                            // Default state: show token preview
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                                {tokenPreview || 'No tokens'}
                                                                            </span>
                                                                        ) : hasSelectedToken ? (
                                                                            // Selected state with token: show selected token
                                                                            <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                                                                                {destinationToken}
                                                                            </span>
                                                                        ) : (
                                                                            // Selected state without token: show "Select Token"
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                Select Token
                                                                            </span>
                                                                        )}
                                                                        {/* Show dropdown chevron when network is selected */}
                                                                        {isNetworkSelected && (
                                                                            <svg
                                                                                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>

                                                                    {/* Token Dropdown - show when network is selected and dropdown is open */}
                                                                    {isDropdownOpen && networkTokens.length > 0 && (() => {
                                                                        // Filter tokens based on search term
                                                                        const filteredDropdownTokens = destinationTokenDropdownSearchTerm
                                                                            ? networkTokens.filter(token => {
                                                                                const search = destinationTokenDropdownSearchTerm.toLowerCase().trim();
                                                                                const tokenSymbol = (token.symbol || token.asset || token).toLowerCase();
                                                                                const displayAsset = (token.display_asset || '').toLowerCase();
                                                                                return tokenSymbol.includes(search) || displayAsset.includes(search);
                                                                            })
                                                                            : networkTokens;
                                                                        
                                                                        return (
                                                                            <div 
                                                                                data-token-dropdown
                                                                                className="absolute left-3 right-3 top-full mt-1 z-50 rounded-lg bg-gray-100 dark:bg-[#181818] shadow-lg overflow-hidden"
                                                                                style={{ display: 'flex', flexDirection: 'column' }}
                                                                            >
                                                                                {/* Search Bar */}
                                                                                <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#181818] px-2 py-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={destinationTokenDropdownSearchTerm}
                                                                                        onChange={(e) => setDestinationTokenDropdownSearchTerm(e.target.value)}
                                                                                        placeholder="Search tokens..."
                                                                                        className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-2 py-1.5 text-xs text-gray-900 dark:text-gray-200 outline-none transition-colors focus:border-primary dark:focus:border-primary-light focus:ring-1 focus:ring-primary/30 dark:focus:ring-primary-light/30"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        onKeyDown={(e) => e.stopPropagation()}
                                                                                    />
                                                                                </div>
                                                                                {/* Tokens List */}
                                                                                <div 
                                                                                    className={filteredDropdownTokens.length > 8 ? 'custom-scrollbar' : ''}
                                                                                    style={{ 
                                                                                        padding: '4px', 
                                                                                        display: 'flex', 
                                                                                        flexDirection: 'column', 
                                                                                        gap: '8px',
                                                                                        ...(filteredDropdownTokens.length > 8 ? { maxHeight: '256px', overflowY: 'auto' } : {})
                                                                                    }}
                                                                >
                                                                                    {filteredDropdownTokens.length === 0 ? (
                                                                                        <div className="px-2 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                                                                            No tokens found
                                                                                        </div>
                                                                                    ) : (
                                                                                        filteredDropdownTokens.map((token) => {
                                                                                            const tokenSymbol = token.symbol || token.asset || token;
                                                                                            const isTokenSelected = destinationToken === tokenSymbol;
                                                                                            return (
                                                                                                <div
                                                                                                    key={tokenSymbol}
                                                                                                    className={`flex items-center justify-between cursor-pointer transition-colors ${
                                                                                                        isTokenSelected 
                                                                                                            ? 'bg-gray-200/50 dark:bg-white/5' 
                                                                                                            : 'hover:bg-gray-200 dark:hover:bg-white/10'
                                                                                                    }`}
                                                                                                    style={{ padding: '4px', borderRadius: '6px', height: '24px' }}
                                                                                                    onClick={(e) => handleTokenSelect(token, e)}
                                                                                                >
                                                                                                    <div className="flex items-center" style={{ gap: '4px' }}>
                                                                                                        {token.logo && (
                                                                                                            <img
                                                                                                                src={token.logo}
                                                                                                                alt={tokenSymbol}
                                                                                                                className="rounded-full object-contain flex-shrink-0"
                                                                                                                style={{ width: '16px', height: '16px' }}
                                                                                                                onError={(e) => e.target.style.display = 'none'}
                                                                                                            />
                                                                                                        )}
                                                                                                        <span 
                                                                                                            className="font-semibold leading-none"
                                                                                                            style={{ 
                                                                                                                fontSize: '12px',
                                                                                                                color: isTokenSelected ? 'white' : '#9da3ae'
                                                                                                            }}
                                                                                                        >
                                                                                                            {tokenSymbol}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    {isTokenSelected && (
                                                                                                        <svg 
                                                                                                            className="text-white flex-shrink-0" 
                                                                                                            style={{ width: '16px', height: '16px' }}
                                                                                                            fill="none" 
                                                                                                            viewBox="0 0 24 24" 
                                                                                                            stroke="currentColor"
                                                                                                        >
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                                        </svg>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {showAllDestinationNetworks && (
                                                        <div className="sticky bottom-4 flex justify-center z-10 -mt-12 mb-4" style={{ pointerEvents: 'none' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    // Scroll to top of destination list when collapsing
                                                                    step1Ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
                                                                    setShowAllDestinationNetworks(false);
                                                                }}
                                                                className="flex items-center gap-1.5 bg-gray-700 dark:bg-gray-600 text-white px-3 h-8 text-sm font-medium transition-colors hover:bg-gray-800 dark:hover:bg-gray-500 pointer-events-auto"
                                                                style={{ height: '32px', borderRadius: '72px' }}
                                                            >
                                                                <span>Collapse</span>
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                    {hasMoreDestNetworks && !showAllDestinationNetworks && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowAllDestinationNetworks(true);
                                                            }}
                                                            className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors hover:text-primary dark:hover:text-primary-light"
                                                        >
                                                            {`Load More (${allDestNetworks.length - displayedDestNetworks.length} more)`}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Wallet Address */}
                                        <div className="flex flex-col gap-2 col-span-2">
                                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                Your Wallet Address <span className="text-primary dark:text-primary-light">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={walletAddress}
                                                    onChange={handleWalletAddressChange}
                                                    placeholder="0x..."
                                                    className={`flex-1 min-h-[44px] rounded-lg border px-4 py-3 text-sm outline-none transition-colors text-gray-900 dark:text-gray-200 bg-white dark:bg-background-dark ${walletAddressError
                                                        ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30'
                                                        : 'border-gray-200 dark:border-white/10 focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30'
                                                        }`}
                                                    onBlur={(e) => {
                                                        if (!walletAddressError) {
                                                            e.target.style.boxShadow = 'none';
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAutofillPlaceholder}
                                                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition whitespace-nowrap ${!walletAddress
                                                        ? 'border-none bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light'
                                                        : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-600 dark:text-gray-400 hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light'
                                                        }`}
                                                    title="Fill with placeholder address"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                                                    <span>Fill</span>
                                                </button>
                                            </div>
                                            {walletAddressError && (
                                                <div className="mt-1 text-xs text-destructive">
                                                    {walletAddressError}
                                                </div>
                                            )}
                                        </div>


                                    </div>
                                </div>
                            </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-200 dark:bg-white/10"></div>

                                {/* Step 2: Select Source */}
                                <div
                                    id="step2"
                                    ref={step2Ref}
                                    className="relative flex flex-col gap-8"
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-200" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-900 shadow-sm dark:border-white/10 dark:bg-background-dark dark:text-gray-100">2</span>
                                            Select Source
                                        </h2>
                                        {tokenMode === 'single' ? (
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                Select which networks can send tokens to receive{' '}
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                    <span>{destinationToken}</span> <span>on</span> <span>{selectedNetworkDisplay}</span>
                                                </span>
                                                {' '}on your network.
                                            </p>
                                        ) : (
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                Select the source network and token - users will receive the matching token on your destination network.
                                            </p>
                                        )}
                                    </div>


                                    {/* Get Sources Button */}
                                    {(() => {
                                        // In multiple mode, only destination network is required (token is selected in step3-destination)
                                        // Wallet address is also required
                                        const walletValidation = validateWalletAddress(walletAddress);
                                        const destinationComplete = destinationNetwork && 
                                            (tokenMode === 'single' ? destinationToken : true);
                                        const step1Complete = destinationComplete && walletValidation.valid;
                                        const isDisabled = isLoadingStep2 || !step1Complete;
                                        return (
                                            <div className="relative mt-3 block group">
                                                <button
                                                    onClick={handleGetSources}
                                                    disabled={isDisabled}
                                                    aria-label={showSourceNetworks && sources.length > 0 ? "Refresh available source networks" : "Fetch available source networks"}
                                                    className={`inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors w-full ${isDisabled
                                                        ? 'cursor-pointer text-gray-400'
                                                        : (showSourceNetworks && sources.length > 0)
                                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer'
                                                            : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                                        }`}
                                                    style={isDisabled ? { backgroundColor: '#590E25' } : {}}
                                                >
                                                    {isLoadingStep2 ? 'Loading...' : (showSourceNetworks && sources.length > 0 ? 'Refresh' : 'Get Sources')}
                                                </button>
                                                {isDisabled && !step1Complete && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50" style={{ fontSize: '14px' }}>
                                                        {!walletValidation.valid
                                                            ? 'Please enter your wallet address in Step 1 first'
                                                            : 'Please complete Step 1: Setup Destination first'}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Result Box */}
                                    <ResultBox result={step2Result} />

                                    {/* Source Networks Grid */}
                                    {showSourceNetworks && sources.length > 0 && (() => {
                                        const sortedSources = sources.sort((a, b) => b.source_rank - a.source_rank);
                                        
                                        // Filter sources based on search term (prioritize startsWith, then includes)
                                        const filteredSources = sourceSearchTerm
                                            ? (() => {
                                                const search = sourceSearchTerm.toLowerCase().trim();
                                                const startsWithMatches = [];
                                                const includesMatches = [];
                                                
                                                sortedSources.forEach(source => {
                                                    const displayName = source.displayName?.toLowerCase() || '';
                                                    const name = source.name?.toLowerCase() || '';
                                                    const startsWith = displayName.startsWith(search) || name.startsWith(search);
                                                    const includes = displayName.includes(search) || name.includes(search);
                                                    
                                                    if (startsWith) {
                                                        startsWithMatches.push(source);
                                                    } else if (includes) {
                                                        includesMatches.push(source);
                                                    }
                                                });
                                                
                                                // Prioritize startsWith matches, then includes matches
                                                return [...startsWithMatches, ...includesMatches];
                                            })()
                                            : sortedSources;
                                        
                                        const featuredSources = filteredSources.filter(source => FEATURED_NETWORKS.includes(source.name));
                                        const otherSources = filteredSources.filter(source => !FEATURED_NETWORKS.includes(source.name));

                                        const minSourcesToShow = 9;
                                        // When searching, preserve search priority (startsWith first, then includes)
                                        // When not searching, use featured/other split
                                        const allSources = sourceSearchTerm 
                                            ? filteredSources  // Preserve search priority order
                                            : [...featuredSources, ...otherSources];  // Featured first when not searching

                                        // Use pagination logic - when searching, preserve search priority; when not searching, use featured/other split
                                        let displayedSources;
                                        if (showAllSourceNetworks) {
                                            displayedSources = allSources;
                                        } else if (sourceSearchTerm) {
                                            // When searching, use allSources directly with pagination (preserves search priority)
                                            displayedSources = allSources.slice(0, minSourcesToShow);
                                            
                                            // Ensure selected source is always visible when collapsed
                                            if (sourceNetwork) {
                                                const selectedSource = allSources.find(source => source.name === sourceNetwork);
                                                if (selectedSource && !displayedSources.some(source => source.name === sourceNetwork)) {
                                                    // Remove last item and add selected source
                                                    displayedSources = [
                                                        ...allSources.slice(0, minSourcesToShow - 1),
                                                        selectedSource
                                                    ];
                                                }
                                            }
                                        } else {
                                            // When not searching, show featured sources + enough other sources to fill at least 3 rows
                                            const featuredCount = featuredSources.length;
                                            const neededFromOthers = Math.max(0, minSourcesToShow - featuredCount);
                                            const otherSourcesToShow = otherSources.slice(0, neededFromOthers);
                                            displayedSources = [...featuredSources, ...otherSourcesToShow];
                                            
                                            // Ensure selected source is always visible when collapsed
                                            if (sourceNetwork) {
                                                const selectedSource = allSources.find(source => source.name === sourceNetwork);
                                                if (selectedSource && !displayedSources.some(source => source.name === sourceNetwork)) {
                                                    // Filter out the selected source from otherSourcesToShow
                                                    const otherSourcesWithoutSelected = otherSourcesToShow.filter(source => source.name !== sourceNetwork);
                                                    // Calculate how many other sources we can show (accounting for the selected source)
                                                    const slotsForOthers = minSourcesToShow - featuredCount - 1; // -1 for selected source
                                                    const otherSourcesToInclude = otherSourcesWithoutSelected.slice(0, Math.max(0, slotsForOthers));
                                                    // Insert selected source after featured sources, before other sources
                                                    displayedSources = [
                                                        ...featuredSources,
                                                        selectedSource,
                                                        ...otherSourcesToInclude
                                                    ];
                                                }
                                            }
                                        }

                                        // Calculate if there would be more sources when collapsed (for showing the toggle button)
                                        const hasMoreSources = sourceSearchTerm
                                            ? allSources.length > displayedSources.length  // When searching, check if there are more than displayed
                                            : (() => {
                                                // When not searching, use featured/other logic
                                                const featuredCount = featuredSources.length;
                                                const neededFromOthers = Math.max(0, minSourcesToShow - featuredCount);
                                                const collapsedCount = featuredCount + Math.min(otherSources.length, neededFromOthers);
                                                return allSources.length > collapsedCount;
                                            })();

                                        return (
                                            <div className="mt-4 flex flex-col gap-2">
                                                {/* Search Bar */}
                                                <div className="mb-2">
                                                    <input
                                                        ref={sourceSearchInputRef}
                                                        type="text"
                                                        value={sourceSearchTerm}
                                                        onChange={(e) => setSourceSearchTerm(e.target.value)}
                                                        placeholder="Search networks..."
                                                        className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none transition-colors focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30"
                                                    />
                                                </div>
                                                <div
                                                    className="grid gap-3 relative"
                                                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}
                                                >
                                                    {displayedSources.map((source) => {
                                                        const shortName = source.displayName
                                                            .replace(/_MAINNET/g, '')
                                                            .replace(/_SEPOLIA/g, ' Sep')
                                                            .replace(/_/g, ' ');
                                                        const isNetworkSelected = sourceNetwork === source.name;
                                                        const hasSelectedToken = isNetworkSelected && sourceToken;
                                                        const isDropdownOpen = openTokenDropdown === source.name;
                                                        // Use networkMap for full token objects (with logos), fall back to source.tokens (strings)
                                                        const fullTokens = networkMap[source.name]?.tokens || [];
                                                        const tokenSymbols = source.tokens || [];
                                                        const tokenPreview = tokenSymbols.slice(0, 3).join(', ') + (tokenSymbols.length > 3 ? '...' : '');

                                                        // In single token mode, we don't need dropdown - just select first token
                                                        const isSingleTokenMode = tokenMode === 'single';
                                                        const firstToken = fullTokens.length > 0 ? fullTokens[0] : null;
                                                        const firstTokenSymbol = firstToken ? (firstToken.symbol || firstToken.asset || firstToken) : null;

                                                        // Handle card click - select network and open dropdown if not already selected
                                                        const handleCardClick = (e) => {
                                                            e.stopPropagation();
                                                            if (!isNetworkSelected) {
                                                                // In single token mode or only one token, auto-select
                                                                if (isSingleTokenMode || fullTokens.length === 1) {
                                                                    if (firstTokenSymbol) {
                                                                        selectSource(source.name, firstTokenSymbol);
                                                                    }
                                                                } else {
                                                                    // Multiple token mode with multiple tokens - show dropdown
                                                                    setSourceNetwork(source.name);
                                                                    setSourceToken('');
                                                                    setShowSelectedNetworkInfo(true);
                                                                    setOpenTokenDropdown(source.name);
                                                                    // Clear any subsequent steps
                                                                    refreshStepsFrom(3);
                                                                }
                                                            }
                                                        };

                                                        // Handle token area click - open dropdown (only in multiple token mode)
                                                        const handleTokenAreaClick = (e) => {
                                                            e.stopPropagation();
                                                            
                                                            // In single token mode, just select the network and token
                                                            if (isSingleTokenMode) {
                                                                if (firstTokenSymbol) {
                                                                    selectSource(source.name, firstTokenSymbol);
                                                                }
                                                                return;
                                                            }
                                                            
                                                            // If only one token, auto-select it
                                                            if (fullTokens.length === 1) {
                                                                if (firstTokenSymbol) {
                                                                    selectSource(source.name, firstTokenSymbol);
                                                                }
                                                                return;
                                                            }
                                                            
                                                            if (!isNetworkSelected) {
                                                                // Select network first, then open dropdown
                                                                setSourceNetwork(source.name);
                                                                setSourceToken('');
                                                                setShowSelectedNetworkInfo(true);
                                                                refreshStepsFrom(3);
                                                            }
                                                            setOpenTokenDropdown(isDropdownOpen ? null : source.name);
                                                        };

                                                        // Handle token selection from dropdown
                                                        const handleTokenSelect = (token, e) => {
                                                            e.stopPropagation();
                                                            const tokenSymbol = token.symbol || token.asset || token;
                                                            selectSource(source.name, tokenSymbol);
                                                            setOpenTokenDropdown(null);
                                                        };

                                                        return (
                                                            <div
                                                                key={source.name}
                                                                data-source-card
                                                                className={`relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all cursor-pointer ${isNetworkSelected
                                                                    ? 'border-primary dark:border-primary-light'
                                                                    : 'border-gray-200 bg-white dark:bg-background-dark hover:border-primary/50 dark:hover:border-primary-light/50'
                                                                    }`}
                                                                style={!isNetworkSelected ? { borderColor: theme === 'dark' ? 'rgba(20, 26, 39, 1)' : undefined } : undefined}
                                                                onClick={handleCardClick}
                                                            >
                                                                {/* Network Info */}
                                                                <div className="flex flex-col gap-2 pl-1">
                                                                    {source.logo && (
                                                                        <img
                                                                            src={source.logo}
                                                                            alt={shortName}
                                                                            className="h-8 w-8 rounded-full object-contain bg-gray-100 dark:bg-gray-800 p-0.5"
                                                                            style={{ margin: 0 }}
                                                                            onError={(e) => e.target.style.display = 'none'}
                                                                        />
                                                                    )}
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                        {shortName}
                                                                    </span>
                                                                </div>

                                                                {/* Token Area */}
                                                                <div
                                                                    className={`flex items-center justify-between rounded-lg bg-gray-100 p-2 transition-colors ${
                                                                        isSingleTokenMode ? '' : 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800/50'
                                                                    }`}
                                                                    style={theme === 'dark' ? { backgroundColor: 'rgba(20, 26, 39, 0.5)' } : {}}
                                                                    onClick={handleTokenAreaClick}
                                                                >
                                                                    {isSingleTokenMode ? (
                                                                        // Single token mode: just show the token name
                                                                        <span className={`text-xs truncate ${isNetworkSelected ? 'font-medium text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                            {firstTokenSymbol || tokenPreview || 'No tokens'}
                                                                        </span>
                                                                    ) : !isNetworkSelected ? (
                                                                        // Default state: show token preview
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                            {tokenPreview || 'No tokens'}
                                                                        </span>
                                                                    ) : hasSelectedToken ? (
                                                                        // Selected state with token: show selected token
                                                                        <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                                                                            {sourceToken}
                                                                        </span>
                                                                    ) : (
                                                                        // Selected state without token: show "Select Token"
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Select Token
                                                                        </span>
                                                                    )}
                                                                    {/* Only show dropdown chevron in multiple token mode when network is selected */}
                                                                    {!isSingleTokenMode && isNetworkSelected && (
                                                                        <svg
                                                                            className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    )}
                                                                </div>

                                                                {/* Token Dropdown - only in multiple token mode */}
                                                                {!isSingleTokenMode && isDropdownOpen && fullTokens.length > 0 && (
                                                                    <div 
                                                                        className="absolute left-3 right-3 top-full mt-1 z-50 rounded-lg bg-gray-100 dark:bg-[#181818] shadow-lg"
                                                                        style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                                                                    >
                                                                        {fullTokens.map((token) => {
                                                                            const tokenSymbol = token.symbol || token.asset || token;
                                                                            const isTokenSelected = sourceToken === tokenSymbol;
                                                                            return (
                                                                                <div
                                                                                    key={tokenSymbol}
                                                                                    className={`flex items-center justify-between cursor-pointer transition-colors ${
                                                                                        isTokenSelected 
                                                                                            ? 'bg-gray-200/50 dark:bg-white/5' 
                                                                                            : 'hover:bg-gray-200 dark:hover:bg-white/10'
                                                                                    }`}
                                                                                    style={{ padding: '4px', borderRadius: '6px', height: '24px' }}
                                                                                    onClick={(e) => handleTokenSelect(token, e)}
                                                                                >
                                                                                    <div className="flex items-center" style={{ gap: '4px' }}>
                                                                                        {token.logo && (
                                                                                            <img
                                                                                                src={token.logo}
                                                                                                alt={tokenSymbol}
                                                                                                className="rounded-full object-contain flex-shrink-0"
                                                                                                style={{ width: '16px', height: '16px' }}
                                                                                                onError={(e) => e.target.style.display = 'none'}
                                                                                            />
                                                                                        )}
                                                                                        <span 
                                                                                            className="font-semibold leading-none"
                                                                                            style={{ 
                                                                                                fontSize: '12px',
                                                                                                color: isTokenSelected ? 'white' : '#9da3ae'
                                                                                            }}
                                                                                        >
                                                                                            {tokenSymbol}
                                                                                        </span>
                                                                                    </div>
                                                                                    {isTokenSelected && (
                                                                                        <svg 
                                                                                            className="text-white flex-shrink-0" 
                                                                                            style={{ width: '16px', height: '16px' }}
                                                                                            fill="none" 
                                                                                            viewBox="0 0 24 24" 
                                                                                            stroke="currentColor"
                                                                                        >
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                        </svg>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {showAllSourceNetworks && (
                                                    <div className="sticky bottom-4 flex justify-center z-10 -mt-12 mb-4" style={{ pointerEvents: 'none' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                // Scroll to top of source list when collapsing
                                                                step2Ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
                                                                setShowAllSourceNetworks(false);
                                                            }}
                                                            className="flex items-center gap-1.5 bg-gray-700 dark:bg-gray-600 text-white px-3 h-8 text-sm font-medium transition-colors hover:bg-gray-800 dark:hover:bg-gray-500 pointer-events-auto"
                                                            style={{ height: '32px', borderRadius: '72px' }}
                                                        >
                                                            <span>Collapse</span>
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                                {hasMoreSources && !showAllSourceNetworks && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowAllSourceNetworks(true);
                                                        }}
                                                        className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors hover:text-primary dark:hover:text-primary-light"
                                                    >
                                                        {`Load More (${allSources.length - displayedSources.length} more)`}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Mobile API Activity */}
                                    {windowWidth < 1024 && <ApiActivityDisplay stepKey="step2" className="xl:hidden mt-6" />}
                                </div>
                            </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-200 dark:bg-white/10"></div>

                            {/* Step 3: Select Destination Token (Multiple Tokens Mode Only) */}
                            {tokenMode === 'multiple' && (
                                <>
                                <div
                                    id="step3-destination"
                                    ref={step3DestinationRef}
                                    className="relative flex flex-col gap-8"
                                    style={{
                                        scrollMarginTop: '96px'
                                    }}
                                >
                                    <div className="flex flex-col gap-4">
                                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-200" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-900 shadow-sm dark:border-white/10 dark:bg-background-dark dark:text-gray-100">3</span>
                                            Select Destination Token
                                        </h2>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            After the user selects a source, use the destinations endpoint to determine the token they'll receive on{' '}
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                {selectedNetworkDisplay}
                                            </span>
                                            .
                                        </p>

                                        {/* Get Available Tokens Button */}
                                        {(() => {
                                            const step2Complete = sourceNetwork && sourceToken;
                                            const isDisabled = isLoadingStep3Destination || !step2Complete;
                                            return (
                                                <div className="relative mt-2 block group">
                                                    <button
                                                        onClick={handleGetDestinationTokens}
                                                        disabled={isDisabled}
                                                        aria-label={showDestinationTokens && tokens.length > 0 ? "Refresh available destination tokens" : "Fetch available destination tokens"}
                                                        className={`inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors w-full ${isDisabled
                                                            ? 'cursor-pointer text-gray-400'
                                                            : (showDestinationTokens && tokens.length > 0)
                                                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer'
                                                                : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                                            }`}
                                                        style={isDisabled ? { backgroundColor: '#590E25' } : {}}
                                                    >
                                                        {isLoadingStep3Destination ? 'Loading...' : (showDestinationTokens && tokens.length > 0 ? 'Refresh' : 'Get Available Tokens')}
                                                    </button>
                                                    {isDisabled && !step2Complete && (
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50" style={{ fontSize: '14px' }}>
                                                            Please complete Step 2: Select Source first
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Success Message (inline, dimmed when loading) */}
                                        {step3DestinationResult.visible && step3DestinationResult.variant === 'success' && (
                                            <div className={`text-sm leading-relaxed flex items-start gap-3 text-green-600 dark:text-green-400 ${isLoadingStep3Destination ? 'opacity-50' : ''}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                </svg>
                                                <div className="flex-1">
                                                    {step3DestinationResult.description ? (
                                                        <>
                                                            <div className="font-medium mb-1">
                                                                {step3DestinationResult.message}
                                                            </div>
                                                            <div className="opacity-90">
                                                                {step3DestinationResult.description}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div>{step3DestinationResult.message}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Destination Tokens Grid */}
                                        {showDestinationTokens && tokens.length > 0 && (
                                            <div
                                                className="mt-4 grid gap-3"
                                                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}
                                            >
                                                {tokens.map((token) => {
                                                    const tokenSymbol = token.symbol || token.display_asset || token;
                                                    const isSelected = destinationTokenMultiple === tokenSymbol;

                                                    return (
                                                        <button
                                                            key={tokenSymbol}
                                                            type="button"
                                                            onClick={() => selectDestinationToken(tokenSymbol)}
                                                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-all ${isSelected
                                                                ? 'border-primary dark:border-primary-light bg-primary/15 dark:bg-primary-light/15 text-primary dark:text-primary-light shadow-md'
                                                                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200 shadow-sm hover:border-primary dark:hover:border-primary-light hover:bg-primary/5 dark:hover:bg-primary-light/5'
                                                                }`}
                                                        >
                                                            {token.logo && (
                                                                <img
                                                                    src={token.logo}
                                                                    alt={tokenSymbol}
                                                                    className="h-9 w-9 rounded-full object-contain bg-gray-100 dark:bg-gray-800 p-0.5 pointer-events-none select-none"
                                                                    style={{ touchAction: 'none', userSelect: 'none', marginTop: '4px', marginBottom: '4px' }}
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            )}
                                                            <span className="text-sm font-semibold">
                                                                {tokenSymbol}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Mobile API Activity */}
                                        {windowWidth < 1024 && <ApiActivityDisplay stepKey="step3-destination" className="xl:hidden mt-6" />}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-200 dark:bg-white/10"></div>
                                </>
                            )}

                                {/* Step 3/4: Get Quote */}
                                <div
                                    id="step3"
                                    ref={step3Ref}
                                    className="relative flex flex-col gap-8"
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-200" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-900 shadow-sm dark:border-white/10 dark:bg-background-dark dark:text-gray-100">{tokenMode === 'multiple' ? 4 : 3}</span>
                                            Get Quote (Optional)
                                        </h2>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            Get a detailed quote for bridging from{' '}
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                {sourceNetwork ? `${sourceNetwork.replace(/_/g, ' ')} (${sourceToken})` : 'your selected network'}
                                            </span>
                                            {' '}to{' '}
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                {selectedNetworkDisplay} ({tokenMode === 'single' ? destinationToken : destinationTokenMultiple || 'token'})
                                            </span>
                                            .
                                        </p>
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        <strong>Note:</strong> Getting a quote is optional for creating a swap, but recommended to show users the exact fees, limits, and estimated processing time before they deposit.
                                    </p>

                                    {/* Get Quote Button */}
                                    {(() => {
                                        const step2Complete = sourceNetwork && sourceToken;
                                        // In multiple mode, also requires Step 3 (Select Destination Token) to be completed
                                        const step3DestinationComplete = tokenMode === 'multiple' ? destinationTokenMultiple : true;
                                        const prerequisitesComplete = step2Complete && step3DestinationComplete;
                                        const isDisabled = isLoadingStep3 || !prerequisitesComplete;
                                        return (
                                            <div className="relative mt-3 block group">
                                                <button
                                                    onClick={handleGetQuote}
                                                    disabled={isDisabled}
                                                    aria-label="Get detailed transfer quote"
                                                    className={`inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors w-full ${isDisabled
                                                        ? 'cursor-pointer text-gray-400'
                                                        : (showQuoteDetails && quotes.length > 0)
                                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer'
                                                            : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                                        }`}
                                                    style={isDisabled ? { backgroundColor: '#590E25' } : {}}
                                                >
                                                    {isLoadingStep3 ? 'Loading...' : (showQuoteDetails && quotes.length > 0 ? 'Refresh' : 'Get Detailed Quote')}
                                                </button>
                                                {isDisabled && !prerequisitesComplete && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50" style={{ fontSize: '14px' }}>
                                                        {tokenMode === 'multiple' && !step3DestinationComplete
                                                            ? 'Please complete Step 3: Select Destination Token first'
                                                            : !step2Complete
                                                                ? 'Please complete Step 2: Select Source first'
                                                                : `Please complete ${getPrerequisiteStep('step3')} first`}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Result Box */}
                                    <ResultBox result={step3Result} />

                                    {/* Quote Details */}
                                    {showQuoteDetails && quotes.length > 0 && (
                                        <div className="mt-4 space-y-4">
                                            {quotes.length > 1 && (
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                    Available Routes ({quotes.length})
                                                </h4>
                                            )}
                                            {quotes.map((quote, index) => {
                                                const formatTime = (ms) => {
                                                    if (!ms || ms === 0) return 'Instant';
                                                    const totalSeconds = Math.floor(ms / 1000);
                                                    const hours = Math.floor(totalSeconds / 3600);
                                                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                                                    const seconds = totalSeconds % 60;
                                                    if (hours > 0) return `~${hours}h ${minutes}m`;
                                                    if (minutes > 0) return `~${minutes}m`;
                                                    return `~${seconds}s`;
                                                };

                                                const minAmount = formatAmount(quote.min_amount) || '0';
                                                const maxAmount = formatAmount(quote.max_amount) || '0';
                                                const feeForMin = formatAmount(quote.fee_amount_for_min) || '0';
                                                const feeForMax = formatAmount(quote.fee_amount_for_max) || '0';
                                                const percentageFee = formatAmount(quote.total_percentage_fee) || '0';
                                                const fixedFeeUsd = formatAmount(quote.total_fixed_fee_in_usd) || '0';
                                                const timeDisplay = formatTime(quote.avg_completion_milliseconds);

                                                let usdRate = 0;
                                                if (quote.max_amount_in_usd && quote.max_amount && quote.max_amount > 0) {
                                                    usdRate = quote.max_amount_in_usd / quote.max_amount;
                                                } else if (quote.min_amount_in_usd && quote.min_amount && quote.min_amount > 0) {
                                                    usdRate = quote.min_amount_in_usd / quote.min_amount;
                                                }

                                                const feeForMinUsd = usdRate > 0 ? formatAmount(parseFloat(feeForMin) * usdRate) : '';
                                                const feeForMaxUsd = usdRate > 0 ? formatAmount(parseFloat(feeForMax) * usdRate) : '';

                                                const usdRange = (quote.min_amount_in_usd && quote.max_amount_in_usd)
                                                    ? `$${formatAmount(quote.min_amount_in_usd)} - $${formatAmount(quote.max_amount_in_usd)}`
                                                    : '';

                                                const hasPercentageFee = parseFloat(percentageFee) > 0;
                                                const hasFixedFee = parseFloat(fixedFeeUsd) > 0;
                                                const feeStructureParts = [];
                                                if (hasPercentageFee) feeStructureParts.push(`${percentageFee}%`);
                                                if (hasFixedFee) feeStructureParts.push(`$${fixedFeeUsd}`);
                                                const feeStructureText = feeStructureParts.length ? feeStructureParts.join(' + ') : 'No fees';

                                                return (
                                                    <div key={index} className="rounded-xl border border-gray-200 dark:border-white/10 p-4 flex flex-col gap-4">
                                                        {/* Amount Range */}
                                                        <div className="flex items-baseline gap-[12px]">
                                                            <div className="flex flex-col gap-0">
                                                                <div className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">{minAmount}</div>
                                                                {quote.min_amount_in_usd && (
                                                                    <div className="text-xs text-gray-500" style={{ lineHeight: '16px' }}>${formatAmount(quote.min_amount_in_usd)}</div>
                                                                )}
                                                            </div>
                                                            <span className="text-gray-400 dark:text-gray-500">-</span>
                                                            <div className="flex flex-col gap-0">
                                                                <div className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">{maxAmount} {sourceToken}</div>
                                                                {quote.max_amount_in_usd && (
                                                                    <div className="text-xs text-gray-500" style={{ lineHeight: '16px' }}>${formatAmount(quote.max_amount_in_usd)}</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="h-px bg-gray-200 dark:bg-white/10"></div>

                                                        {/* Routing Path */}
                                                        {quote.path && quote.path.length > 0 && (
                                                            <div className="flex flex-col items-start gap-2">
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">Routing Path</span>
                                                                <div className="flex flex-nowrap items-center gap-2">
                                                                    {quote.path.map((step, pathIndex) => (
                                                                        <div key={pathIndex} className="flex items-center gap-2">
                                                                            <span className="rounded-lg bg-gray-100 dark:bg-[#141A27] px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                                {step.provider_name}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Fee Structure + Processing Time */}
                                                        <div className="flex gap-0 justify-between">
                                                            <div className="w-fit flex flex-col gap-1">
                                                                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Fee Structure</div>
                                                                <div className="flex items-center gap-2">
                                                                    {hasPercentageFee && (
                                                                        <span className="rounded-lg bg-gray-100 dark:bg-[#141A27] px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                            {percentageFee}%
                                                                        </span>
                                                                    )}
                                                                    {hasPercentageFee && hasFixedFee && (
                                                                        <span className="text-gray-400 dark:text-gray-500">+</span>
                                                                    )}
                                                                    {hasFixedFee && (
                                                                        <span className="rounded-lg bg-gray-100 dark:bg-[#141A27] px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                            ${fixedFeeUsd}
                                                                        </span>
                                                                    )}
                                                                    {!hasPercentageFee && !hasFixedFee && (
                                                                        <span className="rounded-lg bg-gray-100 dark:bg-[#141A27] px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                            No fees
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="w-fit flex flex-col gap-1">
                                                                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Processing Time</div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-white flex py-2 px-3 w-fit dark:bg-[#141A27] rounded-lg justify-center items-start">{timeDisplay}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Swap Request Fields */}
                                    {showSwapRequestFields && (
                                        <div className="rounded-xl border border-gray-200 dark:border-[#141A27] p-4 flex flex-col gap-4">
                                            <p className="text-[14px] text-gray-600 dark:text-[#99a0ac]">
                                                Request Body
                                            </p>
                                            <div className="h-px w-full bg-gray-200 dark:bg-[#141A27]" />
                                            <div className="flex flex-col gap-5">
                                                {/* Row 1: SOURCE_NETWORK + SOURCE_TOKEN */}
                                                <div className="flex gap-5 w-full">
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <p className="text-[12px] text-gray-600 dark:text-[#99a0ac]">
                                                            SOURCE_NETWORK
                                                        </p>
                                                        <div className="rounded-md bg-gray-50 dark:bg-[#141A27] px-3 py-2">
                                                            <p className="font-mono text-[14px] text-gray-900 dark:text-white">
                                                                {sourceNetwork}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <p className="text-[12px] text-gray-600 dark:text-[#99a0ac]">
                                                            SOURCE_TOKEN
                                                        </p>
                                                        <div className="rounded-md bg-gray-50 dark:bg-[#141A27] px-3 py-2">
                                                            <p className="font-mono text-[14px] text-gray-900 dark:text-white">
                                                                {sourceToken}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Row 2: DESTINATION_NETWORK + DESTINATION_TOKEN */}
                                                <div className="flex gap-5 w-full">
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <p className="text-[12px] text-gray-600 dark:text-[#99a0ac]">
                                                            DESTINATION_NETWORK
                                                        </p>
                                                        <div className="rounded-md bg-gray-50 dark:bg-[#141A27] px-3 py-2">
                                                            <p className="font-mono text-[14px] text-gray-900 dark:text-white">
                                                                {destinationNetwork}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <p className="text-[12px] text-gray-600 dark:text-[#99a0ac]">
                                                            DESTINATION_TOKEN
                                                        </p>
                                                        <div className="rounded-md bg-gray-50 dark:bg-[#141A27] px-3 py-2">
                                                            <p className="font-mono text-[14px] text-gray-900 dark:text-white">
                                                                {tokenMode === 'single' ? destinationToken : destinationTokenMultiple}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Row 3: DESTINATION_ADDRESS (full width) */}
                                                <div className="flex w-full">
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <p className="text-[12px] text-gray-600 dark:text-[#99a0ac]">
                                                            DESTINATION_ADDRESS
                                                        </p>
                                                        <div className="rounded-md bg-gray-50 dark:bg-[#141A27] px-3 py-2">
                                                            <p className="font-mono text-[14px] break-all text-gray-900 dark:text-white">
                                                                {walletAddress}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Row 4: REFUEL + USE_DEPOSIT_ADDRESS */}
                                                <div className="flex gap-5 w-full">
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <p className="text-[12px] text-gray-600 dark:text-[#99a0ac]">
                                                            REFUEL
                                                        </p>
                                                        <div className="rounded-md bg-gray-50 dark:bg-[#141A27] px-3 py-2">
                                                            <p className="font-mono text-[14px] text-gray-900 dark:text-white">
                                                                false
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <p className="text-[12px] text-gray-600 dark:text-[#99a0ac]">
                                                            USE_DEPOSIT_ADDRESS
                                                        </p>
                                                        <div className="rounded-md bg-gray-50 dark:bg-[#141A27] px-3 py-2">
                                                            <p className="font-mono text-[14px] text-gray-900 dark:text-white">
                                                                true
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs leading-relaxed text-warning dark:text-warning">
                                                <span className="text-sm flex-shrink-0">⚠️</span>
                                                <span>
                                                    <strong>Important:</strong> The <code className="rounded bg-warning/20 dark:bg-warning/10 px-1 py-[2px] text-[11px] font-mono">use_deposit_address: true</code> parameter is critical for this API flow. When set to true, the swap response will include a deposit address that users can send funds to from any supported chain.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mobile API Activity */}
                                    {windowWidth < 1024 && <ApiActivityDisplay stepKey="step3" className="xl:hidden mt-6" />}
                                </div>
                            </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-200 dark:bg-white/10"></div>

                                {/* Step 4/5: Create Swap */}
                                <div
                                    id="step4"
                                    ref={step4Ref}
                                    className="relative flex flex-col gap-8"
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-200" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-900 shadow-sm dark:border-white/10 dark:bg-background-dark dark:text-gray-100">{tokenMode === 'multiple' ? 5 : 4}</span>
                                            Create Swap
                                        </h2>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            Create a swap to get your unique deposit address.
                                        </p>
                                        {/* Create Swap Button */}
                                        {(() => {
                                            // Step 2 completion is required (get quote is optional)
                                            // In multiple mode, Step 3 (Select Destination Token) is also required
                                            const step2Complete = sourceNetwork && sourceToken;
                                            const step3DestinationComplete = tokenMode === 'multiple' ? destinationTokenMultiple : true;
                                            const prerequisitesComplete = step2Complete && step3DestinationComplete;
                                            const isDisabled = isLoadingStep4 || !prerequisitesComplete;
                                            const swapCreated = swapId !== null;
                                            return (
                                                <div className="relative mt-3 block group">
                                                    <button
                                                        onClick={handleCreateSwap}
                                                        disabled={isDisabled}
                                                        aria-label="Create a new swap transaction"
                                                        className={`inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors w-full ${isDisabled
                                                            ? 'cursor-pointer text-gray-400'
                                                            : swapCreated
                                                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer'
                                                                : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                                            }`}
                                                        style={isDisabled ? { backgroundColor: '#590E25' } : {}}
                                                    >
                                                        {isLoadingStep4 ? 'Creating...' : swapCreated ? 'Re-create' : 'Create Swap'}
                                                    </button>
                                                    {isDisabled && !prerequisitesComplete && (
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50" style={{ fontSize: '14px' }}>
                                                            {tokenMode === 'multiple' && !step3DestinationComplete
                                                                ? 'Please complete Step 3: Select Destination Token first'
                                                                : !step2Complete
                                                                    ? 'Please complete Step 2: Select Source first'
                                                                    : `Please complete ${getPrerequisiteStep('step4')} first`}
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Result Box */}
                                    {(!isLoadingStep4 || (isLoadingStep4 && swapId !== null && step4Result.variant === 'success')) && <ResultBox result={step4Result} />}

                                    {/* Deposit Info */}
                                    {showDepositInfo && depositAddress && (
                                        <div className="mt-3 flex flex-col gap-1">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200" style={{ marginTop: '8px' }}>
                                                Send{' '}
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                    {sourceToken}
                                                </span>
                                                {' '}to this address on{' '}
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                    {sourceNetwork.replace(/_MAINNET/g, '').replace(/_SEPOLIA/g, ' Sepolia').replace(/_/g, ' ')}
                                                </span>
                                            </h3>
                                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 font-mono text-sm text-gray-900 dark:text-gray-200" style={{ backgroundColor: 'rgba(20, 26, 39, 1)' }}>
                                                <span className="break-all flex-1 min-w-[200px]">
                                                    {depositAddress}
                                                </span>
                                                <CopyButton
                                                    text={depositAddress}
                                                    size="md"
                                                    className="gap-2"
                                                />
                                            </div>
                                            <div class="api-hint mt-3 flex items-start gap-2 rounded-lg border border-slate-200/60 bg-surface-soft px-3 py-2 text-xs leading-relaxed text-ink-soft dark:border-white/10 dark:bg-surface-dark-soft dark:text-ink-invert-soft">
                                                <span className="text-sm text-primary dark:text-primary-light flex-shrink-0 mt-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                </span>
                                                <span>This address is retrieved from the API response at:{' '}
                                                    <code class="rounded bg-primary/10 dark:bg-primary-light/10 px-1 py-0.5 font-mono text-[11px] text-primary dark:text-primary-light">
                                                        data.deposit_actions[0].to_address
                                                    </code>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mobile API Activity */}
                                    {windowWidth < 1024 && <ApiActivityDisplay stepKey="step4" className="xl:hidden mt-6" />}
                                </div>
                            </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-200 dark:bg-white/10"></div>

                                {/* Step 5/6: Check Status */}
                                <div
                                    id="step5"
                                    ref={step5Ref}
                                    className="relative flex flex-col gap-8"
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-200" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-900 shadow-sm dark:border-white/10 dark:bg-background-dark dark:text-gray-100">{tokenMode === 'multiple' ? 6 : 5}</span>
                                            Check Status
                                        </h2>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            Monitor your transaction status in real-time.
                                        </p>
                                    </div>

                                    {/* Check Status Button */}
                                    {(() => {
                                        const step4Complete = swapId !== null;
                                        const isDisabled = !step4Complete;
                                        return (
                                            <div className="relative mt-3 block group">
                                                <button
                                                    onClick={handleTrackSwap}
                                                    disabled={isDisabled}
                                                    aria-label="Check swap transaction status"
                                                    className={`inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors w-full ${isDisabled
                                                        ? 'cursor-pointer text-gray-400'
                                                        : trackingInterval
                                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer'
                                                            : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                                        }`}
                                                    style={isDisabled ? { backgroundColor: '#590E25' } : {}}
                                                >
                                                    {trackingInterval ? 'Stop Tracking' : 'Check Status'}
                                                </button>
                                                {isDisabled && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50" style={{ fontSize: '14px' }}>
                                                        Please complete {getPrerequisiteStep('step5')} first
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Swap Route Display */}
                                    {showSwapRoute && swapStatus && (() => {
                                        // Get source network and token info
                                        const sourceNetworkData = sources.find(s => s.name === sourceNetwork);
                                        const sourceNetworkLogo = networkMap[sourceNetwork]?.logo || sourceNetworkData?.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const sourceNetworkDisplayName = sourceNetworkData?.displayName || formatNetworkName(sourceNetwork);
                                        const sourceTokenData = networkMap[sourceNetwork]?.tokens?.find(t => t.symbol === sourceToken);
                                        const sourceTokenLogo = sourceTokenData?.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        
                                        // Get destination network and token info
                                        const destNetworkData = networks.find(n => n.name === destinationNetwork);
                                        const destNetworkLogo = destNetworkData?.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        const destToken = tokenMode === 'single' ? destinationToken : destinationTokenMultiple;
                                        const destTokenData = destNetworkData?.tokens?.find(t => t.symbol === destToken);
                                        const destTokenLogo = destTokenData?.logo || 'https://cdn.layerswap.io/logos/layerswap.svg';
                                        
                                        return (
                                            <div className="flex items-center justify-center gap-5 rounded-xl bg-[#141A27] px-3 py-3">
                                                {/* Source */}
                                                <div className="flex gap-2 flex-1 min-w-0 items-center">
                                                    <div className="shrink-0 relative" style={{ width: '32px', height: '32px' }}>
                                                        <img 
                                                            src={sourceNetworkLogo} 
                                                            alt={sourceNetworkDisplayName}
                                                            className="absolute rounded-md object-cover"
                                                            style={{ top: '-32px', left: 0, width: '24px', height: '24px' }}
                                                        />
                                                        <img 
                                                            src={sourceTokenLogo} 
                                                            alt={sourceToken}
                                                            className="absolute rounded-full object-cover border border-[#141A27]"
                                                            style={{ top: '-20px', left: '9px', width: '20px', height: '20px' }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <span className="text-sm font-medium text-white leading-normal">{sourceNetworkDisplayName}</span>
                                                        <span className="text-sm font-medium text-gray-400 leading-normal">{sourceToken}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Arrow */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
                                                    <path d="M5 12h14" />
                                                    <path d="m12 5 7 7-7 7" />
                                                </svg>
                                                
                                                {/* Destination */}
                                                <div className="flex gap-2 flex-1 min-w-0 items-center">
                                                    <div className="shrink-0 relative" style={{ width: '32px', height: '32px' }}>
                                                        <img 
                                                            src={destNetworkLogo} 
                                                            alt={selectedNetworkDisplay}
                                                            className="absolute rounded-md object-cover"
                                                            style={{ top: '-32px', left: 0, width: '24px', height: '24px' }}
                                                        />
                                                        <img 
                                                            src={destTokenLogo} 
                                                            alt={destToken}
                                                            className="absolute rounded-full object-cover border border-[#141A27]"
                                                            style={{ top: '-20px', left: '9px', width: '20px', height: '20px' }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <span className="text-sm font-medium text-white leading-normal">{selectedNetworkDisplay}</span>
                                                        <span className="text-sm font-medium text-gray-400 leading-normal">{destToken}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Status Guide */}
                                    {showStatusGuide && (
                                        <div className="mt-4 flex flex-col gap-3 rounded-xl px-4 py-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400" style={{ backgroundColor: 'rgba(20, 26, 39, 1)', border: 'none' }}>
                                            <div className="flex flex-col items-baseline gap-0">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200 text-sm">
                                                    user_transfer_pending
                                                </span>
                                                <span>Awaiting your deposit to the provided address.</span>
                                            </div>
                                            <div className="flex flex-col items-baseline gap-0">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200 text-sm">
                                                    ls_transfer_pending
                                                </span>
                                                <span>Deposit received—Layerswap is processing your transfer.</span>
                                            </div>
                                            <div className="flex flex-col items-baseline gap-0">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200 text-sm">
                                                    completed
                                                </span>
                                                <span>Transfer successfully sent to the destination account.</span>
                                            </div>
                                            <div className="flex flex-col items-baseline gap-0">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200 text-sm">
                                                    failed
                                                </span>
                                                <span>The transfer could not be completed. Contact support.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Result Box */}
                                    <ResultBox result={step5Result} />

                                    {/* Swap Transactions */}
                                    {showSwapTransactions && swapStatus && (
                                        <div className="mt-4">
                                            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                Transactions
                                            </h4>
                                            {swapTransactions.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {swapTransactions.map((tx, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-3 transition-all"
                                                        >
                                                            <div className="flex flex-1 flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-[2px] text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-400">
                                                                        {tx.type || 'transfer'}
                                                                    </span>
                                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                        {tx.amount || 'N/A'} {typeof tx.token === 'object' ? (tx.token?.symbol || tx.token?.display_asset || '') : (tx.token || '')}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-gray-600 dark:text-gray-400">
                                                                    {typeof tx.network === 'object' ? (tx.network?.name || tx.network?.display_name || 'N/A') : (tx.network || 'N/A')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-3 text-sm italic text-gray-600 dark:text-gray-400">
                                                    No transactions available yet. Waiting for deposit...
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Mobile API Activity */}
                                    {windowWidth < 1024 && <ApiActivityDisplay stepKey="step5" className="xl:hidden mt-6" />}
                                </div>
                            </div>
                            </div>

                            {/* Contact Section */}
                            <div className="mt-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-6 py-6 text-center shadow-sm">
                                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">
                                    Need Help with Integration?
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                    For partnership inquiries and integration support, our team is here to help.
                                </p>
                                <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                                    <a
                                        href="mailto:partners@layerswap.io"
                                        className="inline-flex items-center gap-2 rounded-lg border-none bg-primary dark:bg-primary-light px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark dark:hover:bg-primary-light no-underline"
                                    >
                                        ✉️ partners@layerswap.io
                                    </a>
                                    <a
                                        href="https://t.me/layerswap_dev"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border-none bg-gradient-to-br from-[#2AABEE] to-[#229ED9] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 no-underline"
                                    >
                                        💬 Join Dev Community
                                    </a>
                                </div>
                            </div>

                            {/* Footer */}
                            <footer class="mt-12 border-t border-slate-200/60 pt-6 dark:border-white/10">
                                <div class="flex flex-col items-center gap-4">
                                    <div class="flex flex-wrap justify-center gap-5 text-xs font-medium text-ink-soft dark:text-ink-invert-soft">
                                        <a href="https://www.layerswap.io" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 transition hover:text-brand! border-none">
                                            Layerswap
                                        </a>
                                        <a href="https://docs.layerswap.io" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 transition hover:text-brand! border-none">
                                            Documentation
                                        </a>
                                        <a href="https://x.com/layerswap" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 transition hover:text-brand! border-none">
                                            X
                                        </a>
                                        <a href="https://discord.com/invite/layerswap" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 transition hover:text-brand! border-none">
                                            Discord
                                        </a>
                                        <a href="https://github.com/layerswap" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 transition hover:text-brand! border-none">
                                            GitHub
                                        </a>
                                    </div>
                                    <p class="text-xs text-ink-soft/80 dark:text-ink-invert-soft">
                                        © {new Date().getFullYear()} Layerswap Labs, Inc.
                                    </p>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        </>
    );
};

