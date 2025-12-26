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
    const [showDestinationTokens, setShowDestinationTokens] = useState(false);
    const [showSelectedDestTokenInfo, setShowSelectedDestTokenInfo] = useState(false);
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    // Click outside handlers for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (destinationNetworkDropdownRef.current && !destinationNetworkDropdownRef.current.contains(event.target)) {
                setDestinationNetworkDropdownOpen(false);
            }
            if (destinationTokenDropdownRef.current && !destinationTokenDropdownRef.current.contains(event.target)) {
                setDestinationTokenDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset showAllSourceNetworks when sources change
    useEffect(() => {
        setShowAllSourceNetworks(false);
    }, [sources]);

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
            if (trackingInterval) clearInterval(trackingInterval);
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [trackingInterval, countdownInterval]);

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

    const handleWalletAddressChange = (e) => {
        const value = sanitizeInput(e.target.value);
        setWalletAddress(value);
        const validation = validateWalletAddress(value);
        if (!validation.valid) {
            setWalletAddressError(validation.error);
        } else {
            setWalletAddressError(null);
        }
    };

    const handleModeChange = (e) => {
        const mode = e.target.value;
        setTokenMode(mode);
        if (mode === 'single') {
            setStep3DestinationLocked(true);
        } else {
            setDestinationTokenMultiple('');
            setShowDestinationTokens(false);
            setShowSelectedDestTokenInfo(false);
        }
        resetStepsFrom(2);
    };

    const handleGetSources = async () => {
        const params = new URLSearchParams();
        if (tokenMode === 'single') {
            params.append('destination_network', destinationNetwork);
            params.append('destination_token', destinationToken);
        } else {
            params.append('destination_network', destinationNetwork);
        }
        params.append('has_deposit_address', 'true');

        const endpoint = `/sources?${params.toString()}`;
        setIsLoadingStep2(true);
        setStep2Result({ message: 'Loading...', variant: 'neutral', visible: true });

        try {
            const data = await apiCall(endpoint, 'GET', null, 2);
            if (!data.data || data.data.length === 0) {
                setStep2Result({ message: 'No networks available for this destination.', variant: 'error', visible: true });
                return;
            }
            setStep2Result({ message: `Found ${data.data.length} available networks`, variant: 'success', visible: true });
            displaySources(data.data);
        } catch (error) {
            setStep2Result({ message: `Error: ${error.message || 'Failed to fetch networks'}`, variant: 'error', visible: true });
        } finally {
            setIsLoadingStep2(false);
        }
    };

    const displaySources = (sourcesData) => {
        const networksObj = {};
        sourcesData.forEach(source => {
            const networkName = source.name;
            setNetworkMap(prev => ({ ...prev, [networkName]: source }));

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

        setSources(Object.entries(networksObj).map(([name, info]) => ({
            name,
            ...info,
            tokens: Array.from(info.tokens)
        })));
        setShowSourceNetworks(true);
    };

    const selectSource = (network, token) => {
        setSourceNetwork(network);
        const displayName = network.replace(/_/g, ' ');

        if (tokenMode === 'single') {
            setSourceToken(token);
            setShowSelectedNetworkInfo(true);
            setStep3Locked(false);
        } else {
            setShowSelectedNetworkInfo(true);
            const networkData = networkMap[network];
            if (networkData && networkData.tokens) {
                const tokensArray = Array.isArray(networkData.tokens)
                    ? networkData.tokens
                    : networkData.tokens.map(t => ({ symbol: t.symbol || t.asset || t }));
                if (tokensArray.length === 1) {
                    setSourceToken(tokensArray[0].symbol || tokensArray[0].asset || tokensArray[0]);
                    setStep3DestinationLocked(false);
                } else {
                    setShowSourceTokenSelector(true);
                }
            }
        }
    };

    const handleSourceTokenSelect = (e) => {
        const selectedToken = e.target.value;
        if (!selectedToken) return;
        setSourceToken(selectedToken);
        setShowSelectedNetworkInfo(true);
        setStep3DestinationLocked(false);
    };

    const handleGetDestinationTokens = async () => {
        const params = new URLSearchParams({
            source_network: sourceNetwork,
            source_token: sourceToken
        });
        const endpoint = `/destinations?${params.toString()}`;
        setIsLoadingStep3Destination(true);
        setStep3DestinationResult({ message: 'Loading...', variant: 'neutral', visible: true });

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
        setDestinationTokenMultiple(token);
        setShowSelectedDestTokenInfo(true);
        setStep3Locked(false);
    };

    const handleGetQuote = async () => {
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
        setStep3Result({ message: 'Loading...', variant: 'neutral', visible: true });

        try {
            const data = await apiCall(endpoint, 'GET', null, 3);
            const quotes = data.data || [];
            if (quotes.length === 0) {
                throw new Error('No quotes available for this route');
            }
            setQuotes(quotes);
            setMaxAmount(Math.max(...quotes.map(q => q.max_amount || 0)));
            setStep3Result({
                message: `Found ${quotes.length} liquidity path${quotes.length > 1 ? 's' : ''}`,
                variant: 'success',
                visible: true
            });
            setShowQuoteDetails(true);
            setShowSwapRequestFields(true);
            setStep4Locked(false);
        } catch (error) {
            setStep3Result({ message: `Error: ${error.message || 'Failed to get quote'}`, variant: 'error', visible: true });
        } finally {
            setIsLoadingStep3(false);
        }
    };

    const handleCreateSwap = async () => {
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
        setStep4Result({ message: 'Creating swap...', variant: 'neutral', visible: true });

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
                visible: true
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
        setTrackingInterval(interval);
    };

    const resetStepsFrom = (stepNum) => {
        if (stepNum <= 2) {
            setSourceNetwork('');
            setSourceToken('');
            setShowSourceNetworks(false);
            setShowSelectedNetworkInfo(false);
            setShowSourceTokenSelector(false);
        }
        if (stepNum <= 3) {
            setDestinationTokenMultiple('');
            setShowDestinationTokens(false);
            setShowSelectedDestTokenInfo(false);
        }

        const stepsToLock = [];
        for (let i = stepNum; i <= 5; i++) {
            stepsToLock.push(`step${i}`);
        }
        if (stepNum <= 3) {
            stepsToLock.push('step3-destination');
        }

        setStep2Locked(stepNum <= 2);
        setStep3Locked(stepNum <= 3);
        setStep3DestinationLocked(stepNum <= 3);
        setStep4Locked(stepNum <= 4);
        setStep5Locked(stepNum <= 5);
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

    // Copy to clipboard
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
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

    // Get selected network display name
    const selectedNetworkDisplay = networks.find(n => n.name === destinationNetwork)?.display_name || formatNetworkName(destinationNetwork);

    // Get selected network tokens
    const selectedNetworkTokens = networks.find(n => n.name === destinationNetwork)?.tokens || [];

    // Filter networks based on search
    const filteredNetworks = useMemo(() => {
        if (!networkSearchTerm) return networks;
        const search = networkSearchTerm.toLowerCase();
        return networks.filter(n =>
            (n.display_name || n.name).toLowerCase().includes(search) ||
            n.name.toLowerCase().includes(search)
        );
    }, [networks, networkSearchTerm]);

    // Filter tokens based on search
    const filteredTokens = useMemo(() => {
        if (!tokenSearchTerm) return selectedNetworkTokens;
        const search = tokenSearchTerm.toLowerCase();
        return selectedNetworkTokens.filter(t =>
            (t.symbol || t.display_asset || '').toLowerCase().includes(search)
        );
    }, [selectedNetworkTokens, tokenSearchTerm]);

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
        setMobileMenuOpen(false);
    };

    const navItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'step1', label: 'Step 1: Setup Destination' },
        { id: 'step2', label: 'Step 2: Select Source' },
        ...(tokenMode === 'multiple' ? [{ id: 'step3-destination', label: 'Step 3: Select Destination' }] : []),
        { id: 'step3', label: `${tokenMode === 'multiple' ? 'Step 4:' : 'Step 3:'} Get Quote` },
        { id: 'step4', label: `${tokenMode === 'multiple' ? 'Step 5:' : 'Step 4:'} Create Swap` },
        { id: 'step5', label: `${tokenMode === 'multiple' ? 'Step 6:' : 'Step 5:'} Check Status` }
    ];

    const isStepLocked = (sectionId) => {
        if (sectionId === 'overview' || sectionId === 'step1') return false;
        if (sectionId === 'step2') return step2Locked;
        if (sectionId === 'step3-destination') return step3DestinationLocked;
        if (sectionId === 'step3') return step3Locked;
        if (sectionId === 'step4') return step4Locked;
        if (sectionId === 'step5') return step5Locked;
        return false;
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
    const ReusableDropdown = ({
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
            <div className="relative flex flex-col gap-2" ref={dropdownRef}>
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

    // Phase 1 – Layout, navigation, header, overview section (Tailwind-assisted)
    return (
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
                                        const locked = isStepLocked(item.id);
                                        const active = activeSection === item.id;
                                        return (
                                            <li className="relative scroll-m-4 first:scroll-m-20" key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    onClick={(e) => handleNavClick(item.id, e)}
                                                    className={`group flex items-center pr-3 pl-4 py-1.5 cursor-pointer gap-x-3 text-left rounded-xl w-full outline-offset-[-1px] ${active
                                                        ? 'bg-primary/10 text-primary [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor] dark:text-primary-light dark:bg-primary-light/10'
                                                        : 'hover:bg-gray-600/5 dark:hover:bg-gray-200/5 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                                                        } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
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
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9998,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        opacity: mobileMenuOpen ? 1 : 0,
                        pointerEvents: mobileMenuOpen ? 'auto' : 'none',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            display: 'flex',
                            height: '100%',
                            width: '288px',
                            maxWidth: '100%',
                            flexDirection: 'column',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'transform 0.3s ease'
                        }}
                        className="bg-white dark:bg-background-dark"
                    >
                        <div
                            className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10"
                        >
                            <h3
                                className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300"
                            >
                                Navigation
                            </h3>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="cursor-pointer border-none bg-transparent p-1 text-2xl leading-none text-gray-700 dark:text-gray-300"
                                aria-label="Close Menu"
                            >
                                ×
                            </button>
                        </div>
                        <ul
                            className="flex flex-1 flex-col overflow-y-auto py-4 text-sm"
                            style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}
                        >
                            {navItems.map(item => {
                                const locked = isStepLocked(item.id);
                                const active = activeSection === item.id;
                                return (
                                    <li key={item.id}>
                                        <a
                                            href={`#${item.id}`}
                                            onClick={(e) => handleNavClick(item.id, e)}
                                            className={`group flex items-center pr-3 pl-4 py-1.5 cursor-pointer gap-x-3 text-left rounded-xl w-full outline-offset-[-1px] ${active
                                                ? 'bg-primary/10 text-primary [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor] dark:text-primary-light dark:bg-primary-light/10'
                                                : 'hover:bg-gray-600/5 dark:hover:bg-gray-200/5 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                                                } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
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
            )}
            {/* Main Content */}
            <div className="w-full">
                <div className="px-5 lg:pr-10 lg:pl-[5.5rem] lg:pt-10 mx-auto max-w-6xl flex flex-row-reverse gap-x-12 w-full pt-36">
                    <div className="hidden xl:flex self-start sticky xl:flex-col max-w-[28rem] w-full top-[calc(9.5rem-var(--sidenav-move-up,0px))] overflow-x-hidden" style={{ overflowY: 'visible' }}>
                        {/* API Sidebar */}
                        {windowWidth >= 1024 && (
                            <>
                                <aside className="left-[calc(50vw+240px)] top-[140px] z-10 flex w-[416px] flex-shrink-0 flex-col gap-6 border-l border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/30 pl-6" style={{ overflowY: 'visible', maxHeight: 'none' }}>
                                    <div className="flex flex-col gap-4" style={{ overflowY: 'visible' }}>
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
                                            (() => {
                                                const activeStepKey = getActiveApiStepKey;
                                                if (!activeStepKey) return null;
                                                const activity = apiActivity[activeStepKey];

                                                return (
                                                    <div key={activeStepKey} className="flex flex-col gap-3">
                                                        {/* Request Card */}
                                                        {activity.request && (
                                                            <div className="flex max-h-[calc(50vh-120px)] min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark shadow-sm">
                                                                <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                    <span>API Request</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={async () => {
                                                                                const curl = generateCurlCommand(
                                                                                    activity.request.url || `${API_BASE}${activity.request.endpoint}`,
                                                                                    activity.request.method || 'GET',
                                                                                    activity.request.headers || {},
                                                                                    activity.request.body
                                                                                );
                                                                                await copyToClipboard(curl);
                                                                            }}
                                                                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light"
                                                                        >
                                                                            <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-icon lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg></span>
                                                                            <span>Copy</span>
                                                                        </button>
                                                                        {getApiDocsUrl(activeStepKey) && (
                                                                            <a
                                                                                href={getApiDocsUrl(activeStepKey)}
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
                                                                    {generateCurlCommand(
                                                                        activity.request.url || `${API_BASE}${activity.request.endpoint}`,
                                                                        activity.request.method || 'GET',
                                                                        activity.request.headers || {},
                                                                        activity.request.body
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Response Card */}
                                                        {activity.response && (
                                                            <div className="flex max-h-[calc(50vh-120px)] min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark shadow-sm">
                                                                <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-5 py-4 text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                    <span>API Response</span>
                                                                    <button
                                                                        onClick={async () => {
                                                                            await copyToClipboard(JSON.stringify(activity.response, null, 2));
                                                                        }}
                                                                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light"
                                                                    >
                                                                        <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-icon lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg></span>
                                                                        <span>Copy</span>
                                                                    </button>
                                                                </div>
                                                                <JsonResponseDisplay data={activity.response} theme={theme} stepKey={activeStepKey} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                </aside>
                            </>
                        )}
                    </div>
                    <div className="grow w-full mx-auto xl:w-[calc(100%-28rem)]">
                        {/* Mobile Menu Button */}
                        {windowWidth < 768 && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="mt-2 mb-10 inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all dark:border-white/10 dark:bg-background-dark dark:text-gray-300 hover:bg-gray-600/5 dark:hover:bg-gray-200/5"
                                aria-label="Toggle Navigation Menu"
                            >
                                <span className="block h-[2px] w-5 rounded-[1px] bg-current transition-transform" />
                                <span className="block h-[2px] w-5 rounded-[1px] bg-current transition-opacity" />
                                <span className="block h-[2px] w-5 rounded-[1px] bg-current transition-transform" />
                            </button>
                        )}

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
                            <div id="overview">
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

                                    <div className="mt-8 flex flex-col gap-6">
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
                            <div className="mt-12 h-px bg-gray-200 dark:bg-white/10"></div>

                            {/* Configuration Section */}
                            <div className="flex flex-col gap-3">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                                    Configuration
                                </h2>
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                    Set up your API credentials to get started.
                                </p>

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
                            <div className="mt-12 h-px bg-gray-200 dark:bg-white/10"></div>

                            {/* Step 1: Setup Destination */}
                            <div
                                id="step1"
                                ref={step1Ref}
                                className="relative flex flex-col gap-8 border-b border-gray-200 dark:border-white/10 pb-10 mb-12"
                                style={{
                                    scrollMarginTop: '96px',
                                    opacity: 1
                                }}
                            >
                                <div className="flex flex-col gap-3">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                                        Setup Destination
                                    </h2>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        Configure your destination wallet and select the appropriate integration mode for your use case.
                                    </p>

                                    {/* Mode Selector */}
                                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-4 py-4 shadow-sm">
                                        <span className="mb-4 block text-sm font-semibold text-gray-900 dark:text-gray-200">
                                            Select Your Use Case:
                                        </span>
                                        <div
                                            className="grid gap-3"
                                            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
                                        >
                                            <label
                                                className={`relative flex cursor-pointer flex-col gap-2 rounded-xl px-4 py-4 shadow-sm transition-all border ${tokenMode === 'single'
                                                    ? 'border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10'
                                                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tokenMode"
                                                    value="single"
                                                    checked={tokenMode === 'single'}
                                                    onChange={handleModeChange}
                                                    className="absolute opacity-0 pointer-events-none"
                                                />
                                                <span className={`text-sm font-semibold transition-colors ${tokenMode === 'single' ? 'text-primary dark:text-primary-light' : 'text-gray-900 dark:text-gray-200'
                                                    }`}>
                                                    Fixed Destination Token
                                                </span>
                                                <span className={`text-xs leading-relaxed transition-colors ${tokenMode === 'single' ? 'text-primary dark:text-primary-light' : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    <strong className="font-semibold">DApp Integration:</strong> For prediction markets, DEXs, or apps requiring a specific token (e.g., only USDC)
                                                </span>
                                            </label>
                                            <label
                                                className={`relative flex cursor-pointer flex-col gap-2 rounded-xl px-4 py-4 shadow-sm transition-all border ${tokenMode === 'multiple'
                                                    ? 'border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10'
                                                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tokenMode"
                                                    value="multiple"
                                                    checked={tokenMode === 'multiple'}
                                                    onChange={handleModeChange}
                                                    className="absolute opacity-0 pointer-events-none"
                                                />
                                                <span className={`text-sm font-semibold transition-colors ${tokenMode === 'multiple' ? 'text-primary dark:text-primary-light' : 'text-gray-900 dark:text-gray-200'
                                                    }`}>
                                                    Multiple Destination Tokens
                                                </span>
                                                <span className={`text-xs leading-relaxed transition-colors ${tokenMode === 'multiple' ? 'text-primary dark:text-primary-light' : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    <strong className="font-semibold">Wallet Integration:</strong> Accept various tokens and deliver their respective counterparts on your network
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Destination Fields */}
                                    <div
                                        className="grid gap-4"
                                        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
                                    >
                                        {/* Wallet Address */}
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                Your Wallet Address <span className="text-primary dark:text-primary-light">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={walletAddress}
                                                onChange={handleWalletAddressChange}
                                                placeholder="0x..."
                                                className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-sm outline-none transition-colors text-gray-900 dark:text-gray-200 bg-white dark:bg-background-dark ${walletAddressError
                                                    ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30'
                                                    : 'border-gray-200 dark:border-white/10 focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30'
                                                    }`}
                                                onBlur={(e) => {
                                                    if (!walletAddressError) {
                                                        e.target.style.boxShadow = 'none';
                                                    }
                                                }}
                                            />
                                            {walletAddressError && (
                                                <div className="mt-1 text-xs text-destructive">
                                                    {walletAddressError}
                                                </div>
                                            )}
                                        </div>

                                        {/* Destination Network Dropdown */}
                                        <ReusableDropdown
                                            label={
                                                <>
                                                    Destination Network <span className="text-primary dark:text-primary-light">*</span>
                                                </>
                                            }
                                            selectedValue={destinationNetwork}
                                            selectedDisplay={selectedNetworkDisplay}
                                            placeholder="Select a network"
                                            isOpen={destinationNetworkDropdownOpen}
                                            onToggle={setDestinationNetworkDropdownOpen}
                                            searchTerm={networkSearchTerm}
                                            onSearchChange={setNetworkSearchTerm}
                                            searchPlaceholder="Search networks..."
                                            items={regularNetworks}
                                            featuredItems={featuredNetworks}
                                            showFeaturedSection={true}
                                            dropdownRef={destinationNetworkDropdownRef}
                                            getItemKey={(item) => item.name}
                                            getItemDisplay={(item) => item.display_name || formatNetworkName(item.name)}
                                            getItemImage={(item) => item.logo}
                                            getItemValue={(item) => item.name}
                                            onItemSelect={(item) => {
                                                setDestinationNetwork(item.name);
                                                if (item.tokens && item.tokens.length > 0) {
                                                    setDestinationToken(item.tokens[0].symbol);
                                                }
                                            }}
                                        />

                                        {/* Destination Token Dropdown (Single Mode Only) */}
                                        {tokenMode === 'single' && selectedNetworkTokens.length > 0 && (
                                            <ReusableDropdown
                                                label={
                                                    <>
                                                        Destination Token <span className="text-primary dark:text-primary-light">*</span>
                                                    </>
                                                }
                                                selectedValue={destinationToken}
                                                selectedDisplay={destinationToken}
                                                placeholder="Select a token"
                                                isOpen={destinationTokenDropdownOpen}
                                                onToggle={setDestinationTokenDropdownOpen}
                                                searchTerm={tokenSearchTerm}
                                                onSearchChange={setTokenSearchTerm}
                                                searchPlaceholder="Search tokens..."
                                                items={selectedNetworkTokens}
                                                dropdownRef={destinationTokenDropdownRef}
                                                getItemKey={(item) => item.symbol}
                                                getItemDisplay={(item) => item.symbol || item.display_asset}
                                                getItemImage={(item) => item.logo}
                                                getItemValue={(item) => item.symbol}
                                                onItemSelect={(item) => {
                                                    setDestinationToken(item.symbol);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Select Source */}
                            <div
                                id="step2"
                                ref={step2Ref}
                                className={`relative flex flex-col gap-8 border-b border-gray-200 dark:border-white/10 pb-10 mb-12 ${step2Locked ? 'opacity-35 pointer-events-none grayscale-[50%]' : ''}`}
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
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

                                    {/* API Hint */}
                                    <div class="api-hint mt-3 flex items-start gap-2 rounded-lg border border-slate-200/60 bg-surface-soft px-3 py-2 text-xs leading-relaxed text-ink-soft dark:border-white/10 dark:bg-surface-dark-soft dark:text-ink-invert-soft">
                                        <span className="text-sm text-primary dark:text-primary-light flex-shrink-0 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                        </span>
                                        <span>The <code class="rounded bg-primary/10 dark:bg-primary-light/10 px-1 py-0.5 font-mono text-[11px] text-primary dark:text-primary-light">has_deposit_address=true</code> parameter ensures we only show sources that support generating deposit addresses, which is essential for the deposit flow.</span>
                                    </div>

                                    {/* Get Sources Button */}
                                    <button
                                        onClick={handleGetSources}
                                        disabled={step2Locked || isLoadingStep2}
                                        aria-label="Fetch available source networks"
                                        className={`mt-3 inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${step2Locked
                                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                            }`}
                                    >
                                        {isLoadingStep2 ? 'Loading...' : 'Get Sources'}
                                    </button>

                                    {/* Result Box */}
                                    {step2Result.visible && (
                                        <div className={`mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed break-words ${step2Result.variant === 'success'
                                            ? 'border border-green-500/50 dark:border-green-400/50 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                            : step2Result.variant === 'error'
                                                ? 'border border-destructive/60 dark:border-destructive/60 bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive'
                                                : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200'
                                            }`}>
                                            {step2Result.message}
                                        </div>
                                    )}

                                    {/* Source Networks Grid */}
                                    {showSourceNetworks && sources.length > 0 && (() => {
                                        const featuredSources = sources.filter(source => FEATURED_NETWORKS.includes(source.name));
                                        const otherSources = sources.filter(source => !FEATURED_NETWORKS.includes(source.name));
                                        const displayedSources = showAllSourceNetworks ? sources : featuredSources;
                                        const hasMoreSources = otherSources.length > 0;

                                        return (
                                            <div className="mt-4">
                                                <div
                                                    className="grid gap-3"
                                                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))' }}
                                                >
                                                    {displayedSources.map((source) => {
                                                        const firstToken = source.tokens && source.tokens.length > 0 ? source.tokens[0] : null;
                                                        const shortName = source.displayName
                                                            .replace(/_MAINNET/g, '')
                                                            .replace(/_SEPOLIA/g, ' Sep')
                                                            .replace(/_/g, ' ');
                                                        const isSelected = sourceNetwork === source.name && sourceToken === firstToken;

                                                        return (
                                                            <button
                                                                key={source.name}
                                                                type="button"
                                                                onClick={() => firstToken && selectSource(source.name, firstToken)}
                                                                className={`flex flex-col items-start gap-1.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${isSelected
                                                                    ? 'border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light shadow-md'
                                                                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200 shadow-sm hover:border-primary dark:hover:border-primary-light hover:bg-primary/5 dark:hover:bg-primary-light/5 hover:text-primary dark:hover:text-primary-light'
                                                                    }`}
                                                            >
                                                                {source.logo && (
                                                                    <img
                                                                        src={source.logo}
                                                                        alt={shortName}
                                                                        className="h-8 w-8 rounded-full object-contain bg-gray-100 dark:bg-gray-800 p-0.5"
                                                                        style={{ margin: 0 }}
                                                                        onError={(e) => e.target.style.display = 'none'}
                                                                    />
                                                                )}
                                                                <span className="text-sm font-semibold">
                                                                    {shortName}
                                                                </span>
                                                                {source.tokens && source.tokens.length > 0 && (
                                                                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                                                                        {source.tokens.slice(0, 3).join(', ')}{source.tokens.length > 3 ? '...' : ''}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {!showAllSourceNetworks && hasMoreSources && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAllSourceNetworks(true)}
                                                        className="mt-4 w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors hover:border-primary dark:hover:border-primary-light hover:bg-primary/5 dark:hover:bg-primary-light/5 hover:text-primary dark:hover:text-primary-light"
                                                    >
                                                        Load More ({otherSources.length} more)
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Token Selector (Multiple Mode) */}
                                    {tokenMode === 'multiple' && showSourceTokenSelector && networkMap[sourceNetwork] && (
                                        <div className="mt-5 flex flex-col gap-2">
                                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                Source Token <span className="text-primary dark:text-primary-light">*</span>
                                            </label>
                                            <select
                                                value={sourceToken}
                                                onChange={handleSourceTokenSelect}
                                                className="w-full min-h-[44px] cursor-pointer rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-4 py-3 text-sm text-gray-900 dark:text-gray-200 outline-none transition-colors focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-light/30"
                                                onBlur={(e) => {
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                <option value="">Select a token</option>
                                                {networkMap[sourceNetwork]?.tokens?.map(token => {
                                                    const tokenSymbol = token.symbol || token.asset || token;
                                                    return (
                                                        <option key={tokenSymbol} value={tokenSymbol}>
                                                            {tokenSymbol}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}

                                    {/* Selected Network Info */}
                                    {showSelectedNetworkInfo && sourceNetwork && (
                                        <div className="flex items-center gap-2 rounded-xl bg-primary/10 dark:bg-primary-light/10 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <span className="font-semibold text-gray-900 dark:text-gray-200">Selected:</span>
                                            <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                {sourceNetwork.replace(/_/g, ' ')}
                                            </span>
                                            {sourceToken && (
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                    ({sourceToken})
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Select Destination (Multiple Tokens Mode Only) */}
                            {tokenMode === 'multiple' && (
                                <div
                                    id="step3-destination"
                                    ref={step3DestinationRef}
                                    className={`relative flex flex-col gap-8 border-b border-gray-200 dark:border-white/10 pb-10 mb-12 ${step3DestinationLocked ? 'opacity-35 pointer-events-none grayscale-[50%]' : ''
                                        }`}
                                    style={{
                                        scrollMarginTop: '96px'
                                    }}
                                >
                                    <div className="flex flex-col gap-4">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                                            Select Destination
                                        </h2>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            After the user selects a source, use the destinations endpoint to determine the token they'll receive on{' '}
                                            <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                {selectedNetworkDisplay}
                                            </span>
                                            .
                                        </p>

                                        {/* Get Available Tokens Button */}
                                        <button
                                            onClick={handleGetDestinationTokens}
                                            disabled={step3DestinationLocked || isLoadingStep3Destination}
                                            aria-label="Fetch available destination tokens"
                                            className={`mt-2 inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${step3DestinationLocked
                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                                }`}
                                        >
                                            {isLoadingStep3Destination ? 'Loading...' : 'Get Available Tokens'}
                                        </button>

                                        {/* Result Box */}
                                        {step3DestinationResult.visible && (
                                            <div className={`mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed break-words ${step3DestinationResult.variant === 'success'
                                                ? 'border border-green-500/50 dark:border-green-400/50 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                : step3DestinationResult.variant === 'error'
                                                    ? 'border border-destructive/60 dark:border-destructive/60 bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive'
                                                    : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200'
                                                }`}>
                                                {step3DestinationResult.message}
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
                                                            className={`flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all ${isSelected
                                                                ? 'border-primary dark:border-primary-light bg-primary/15 dark:bg-primary-light/15 text-primary dark:text-primary-light shadow-md'
                                                                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200 shadow-sm hover:border-primary dark:hover:border-primary-light hover:bg-primary/5 dark:hover:bg-primary-light/5'
                                                                }`}
                                                        >
                                                            {token.logo && (
                                                                <img
                                                                    src={token.logo}
                                                                    alt={tokenSymbol}
                                                                    className="h-9 w-9 rounded-full object-contain bg-gray-100 dark:bg-gray-800 p-0.5"
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

                                        {/* Selected Destination Token Info */}
                                        {showSelectedDestTokenInfo && destinationTokenMultiple && (
                                            <div className="flex items-center gap-2 rounded-xl border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                <span className="font-semibold text-gray-900 dark:text-gray-200">Selected:</span>
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                    {destinationTokenMultiple}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3/4: Get Quote */}
                            <div
                                id="step3"
                                ref={step3Ref}
                                className={`relative flex flex-col gap-8 border-b border-gray-200 dark:border-white/10 pb-10 mb-12 ${step3Locked ? 'opacity-35 pointer-events-none grayscale-[50%]' : ''
                                    }`}
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                                        Get Quote (Optional)
                                    </h2>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        Get a detailed quote for bridging from{' '}
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                            {sourceNetwork ? `${sourceNetwork.replace(/_/g, ' ')} (${sourceToken})` : 'your selected network'}
                                        </span>
                                        {' '}to{' '}
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                            {selectedNetworkDisplay} ({tokenMode === 'single' ? destinationToken : destinationTokenMultiple || 'token'})
                                        </span>
                                        .
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        <strong>Note:</strong> Getting a quote is optional for creating a swap, but recommended to show users the exact fees, limits, and estimated processing time before they deposit.
                                    </p>

                                    {/* Get Quote Button */}
                                    <button
                                        onClick={handleGetQuote}
                                        disabled={step3Locked || isLoadingStep3}
                                        aria-label="Get detailed transfer quote"
                                        className={`mt-3 inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${step3Locked
                                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                            }`}
                                    >
                                        {isLoadingStep3 ? 'Loading...' : 'Get Detailed Quote'}
                                    </button>

                                    {/* Result Box */}
                                    {step3Result.visible && (
                                        <div className={`mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed break-words ${step3Result.variant === 'success'
                                            ? 'border border-green-500/50 dark:border-green-400/50 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                            : step3Result.variant === 'error'
                                                ? 'border border-destructive/60 dark:border-destructive/60 bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive'
                                                : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200'
                                            }`}>
                                            {step3Result.message}
                                        </div>
                                    )}

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
                                                    <div key={index} className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark p-4">
                                                        {quote.path && quote.path.length > 0 && (
                                                            <div className="mb-4">
                                                                <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    Routing Path
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    {quote.path.map((step, pathIndex) => (
                                                                        <div key={pathIndex} className="flex items-center gap-2">
                                                                            <span className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-900 dark:text-gray-200">
                                                                                {step.provider_name}
                                                                            </span>
                                                                            {pathIndex < quote.path.length - 1 && (
                                                                                <span className="text-gray-400 dark:text-gray-500">→</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    Amount Range
                                                                </div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                    {minAmount} - {maxAmount} {sourceToken}
                                                                </div>
                                                                {usdRange && (
                                                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                                        {usdRange}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    Processing Time
                                                                </div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                    {timeDisplay}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <div className="rounded bg-gray-50 dark:bg-gray-900/50 p-3">
                                                                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    Min Fee
                                                                </div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                    {feeForMin} {sourceToken}
                                                                </div>
                                                                {feeForMinUsd && (
                                                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                                        ≈ ${feeForMinUsd}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="rounded bg-gray-50 dark:bg-gray-900/50 p-3">
                                                                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    Max Fee
                                                                </div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                    {feeForMax} {sourceToken}
                                                                </div>
                                                                {feeForMaxUsd && (
                                                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                                        ≈ ${feeForMaxUsd}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="rounded bg-gray-50 dark:bg-gray-900/50 p-3">
                                                                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    Fee Structure
                                                                </div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                                    {feeStructureText}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Swap Request Fields */}
                                    {showSwapRequestFields && (
                                        <div className="mt-4 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-4 py-4 shadow-sm">
                                            <h4 className="mb-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                Request Body
                                            </h4>
                                            <div className="grid gap-3 text-xs text-gray-900 dark:text-gray-200" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-medium uppercase text-gray-600 dark:text-gray-400">
                                                        source_network
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-[11px] text-gray-900 dark:text-gray-200">
                                                        {sourceNetwork}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-medium uppercase text-gray-600 dark:text-gray-400">
                                                        source_token
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-[11px] text-gray-900 dark:text-gray-200">
                                                        {sourceToken}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-medium uppercase text-gray-600 dark:text-gray-400">
                                                        destination_network
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-[11px] text-gray-900 dark:text-gray-200">
                                                        {destinationNetwork}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-medium uppercase text-gray-600 dark:text-gray-400">
                                                        destination_token
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-[11px] text-gray-900 dark:text-gray-200">
                                                        {tokenMode === 'single' ? destinationToken : destinationTokenMultiple}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1" style={{ gridColumn: '1 / -1' }}>
                                                    <div className="text-[11px] font-medium uppercase text-gray-600 dark:text-gray-400">
                                                        destination_address
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-[11px] break-all text-gray-900 dark:text-gray-200">
                                                        {walletAddress}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-medium uppercase text-gray-600 dark:text-gray-400">
                                                        refuel
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-[11px] text-gray-900 dark:text-gray-200">
                                                        false
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-medium uppercase text-gray-600 dark:text-gray-400">
                                                        use_deposit_address
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-mono text-[11px] text-gray-900 dark:text-gray-200">
                                                        true
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs leading-relaxed text-warning dark:text-warning">
                                                <span className="text-sm flex-shrink-0">⚠️</span>
                                                <span>
                                                    <strong>Important:</strong> The <code className="rounded bg-warning/20 dark:bg-warning/10 px-1 py-[2px] text-[11px] font-mono">use_deposit_address: true</code> parameter is critical for this API flow. When set to true, the swap response will include a deposit address that users can send funds to from any supported chain.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 4/5: Create Swap */}
                            <div
                                id="step4"
                                ref={step4Ref}
                                className={`relative flex flex-col gap-8 border-b border-gray-200 dark:border-white/10 pb-10 mb-12 ${step4Locked ? 'opacity-35 pointer-events-none grayscale-[50%]' : ''
                                    }`}
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                                        Create Swap
                                    </h2>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        Create a swap to get your unique deposit address.
                                    </p>

                                    {/* Create Swap Button */}
                                    <button
                                        onClick={handleCreateSwap}
                                        disabled={step4Locked || isLoadingStep4}
                                        aria-label="Create a new swap transaction"
                                        className={`mt-3 inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${step4Locked
                                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                            }`}
                                    >
                                        {isLoadingStep4 ? 'Creating...' : 'Create Swap'}
                                    </button>

                                    {/* Result Box */}
                                    {step4Result.visible && (
                                        <div className={`mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed break-words ${step4Result.variant === 'success'
                                            ? 'border border-green-500/50 dark:border-green-400/50 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                            : step4Result.variant === 'error'
                                                ? 'border border-destructive/60 dark:border-destructive/60 bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive'
                                                : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200'
                                            }`}>
                                            {step4Result.message}
                                        </div>
                                    )}

                                    {/* Deposit Info */}
                                    {showDepositInfo && depositAddress && (
                                        <div className="mt-4 flex flex-col gap-3">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                Send{' '}
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                    {sourceToken}
                                                </span>
                                                {' '}to this address on{' '}
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">
                                                    {sourceNetwork.replace(/_MAINNET/g, '').replace(/_SEPOLIA/g, ' Sepolia').replace(/_/g, ' ')}
                                                </span>
                                            </h3>
                                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 font-mono text-sm text-gray-900 dark:text-gray-200">
                                                <span className="break-all flex-1 min-w-[200px]">
                                                    {depositAddress}
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(depositAddress);
                                                            // Visual feedback could be added here
                                                        } catch (err) {
                                                            console.error('Failed to copy:', err);
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 transition hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light"
                                                >
                                                    <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-icon lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg></span>
                                                    <span>Copy</span>
                                                </button>
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
                                </div>
                            </div>

                            {/* Step 5/6: Check Status */}
                            <div
                                id="step5"
                                ref={step5Ref}
                                className={`relative flex flex-col gap-8 border-b border-gray-200 dark:border-white/10 pb-10 mb-12 ${step5Locked ? 'opacity-35 pointer-events-none grayscale-[50%]' : ''
                                    }`}
                                style={{
                                    scrollMarginTop: '96px'
                                }}
                            >
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                                        Check Status
                                    </h2>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        Monitor your transaction status in real-time.
                                    </p>

                                    {/* Check Status Button */}
                                    <button
                                        onClick={handleTrackSwap}
                                        disabled={step5Locked}
                                        aria-label="Check swap transaction status"
                                        className={`mt-3 inline-flex items-center justify-center rounded-lg border-none px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${step5Locked
                                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : trackingInterval
                                                ? 'bg-destructive dark:bg-destructive text-white hover:bg-destructive/90 dark:hover:bg-destructive/90 cursor-pointer'
                                                : 'bg-primary dark:bg-primary-light text-white hover:bg-primary-dark dark:hover:bg-primary-light cursor-pointer'
                                            }`}
                                    >
                                        {trackingInterval ? 'Stop Tracking' : 'Check Status'}
                                    </button>

                                    {/* Swap Route Display */}
                                    {showSwapRoute && swapStatus && (
                                        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            <span className="text-gray-900 dark:text-gray-200">
                                                {sourceNetwork.replace(/_/g, ' ')} ({sourceToken})
                                            </span>
                                            <span>→</span>
                                            <span className="text-gray-900 dark:text-gray-200">
                                                {selectedNetworkDisplay} ({tokenMode === 'single' ? destinationToken : destinationTokenMultiple})
                                            </span>
                                        </div>
                                    )}

                                    {/* Status Guide */}
                                    {showStatusGuide && (
                                        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-4 py-4 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                            <div className="flex flex-wrap items-baseline gap-2">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200">
                                                    user_transfer_pending
                                                </span>
                                                <span>Awaiting your deposit to the provided address.</span>
                                            </div>
                                            <div className="flex flex-wrap items-baseline gap-2">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200">
                                                    ls_transfer_pending
                                                </span>
                                                <span>Deposit received—Layerswap is processing your transfer.</span>
                                            </div>
                                            <div className="flex flex-wrap items-baseline gap-2">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200">
                                                    completed
                                                </span>
                                                <span>Transfer successfully sent to the destination account.</span>
                                            </div>
                                            <div className="flex flex-wrap items-baseline gap-2">
                                                <span className="min-w-[150px] font-semibold uppercase text-gray-900 dark:text-gray-200">
                                                    failed
                                                </span>
                                                <span>The transfer could not be completed. Contact support.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Result Box */}
                                    {step5Result.visible && (
                                        <div className={`mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed break-words ${step5Result.variant === 'success'
                                            ? 'border border-green-500/50 dark:border-green-400/50 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                            : step5Result.variant === 'error'
                                                ? 'border border-destructive/60 dark:border-destructive/60 bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive'
                                                : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-200'
                                            }`}>
                                            {step5Result.message}
                                        </div>
                                    )}

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
                                                                        {tx.amount || 'N/A'} {tx.token || ''}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-gray-600 dark:text-gray-400">
                                                                    {tx.network || 'N/A'}
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
    );
};

