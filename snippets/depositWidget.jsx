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
        'BASE_MAINNET'
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
    
    const getPalette = (theme) => {
        if (theme === 'dark') {
            return {
                bgPrimary: '#000000',
                bgSecondary: '#000000',
                bgTertiary: '#000000',
                bgHighlight: 'rgba(204, 45, 93, 0.08)',
                bgAccent: 'rgba(204, 45, 93, 0.12)',
                textPrimary: '#F4F5F7',
                textSecondary: '#C9CDD4',
                textTertiary: '#8D94A5',
                borderPrimary: 'rgba(148, 163, 184, 0.24)',
                borderSecondary: 'rgba(148, 163, 184, 0.16)',
                borderAccent: 'rgba(204, 45, 93, 0.45)',
                borderSubtle: 'rgba(148, 163, 184, 0.22)',
                accentPrimary: '#CC2D5D',
                accentHover: '#E53E7B',
                panelBg: 'rgba(14, 11, 14, 0.94)',
                panelBorder: 'rgba(148, 163, 184, 0.24)',
                panelHeaderBg: 'rgba(148, 163, 184, 0.12)',
                panelResponseHeaderBg: 'rgba(148, 163, 184, 0.1)',
                panelInfoBg: 'rgba(148, 163, 184, 0.06)',
                codeSurface: 'rgba(6, 5, 8, 0.95)',
                successBg: 'rgba(76, 175, 128, 0.18)',
                successBorder: 'rgba(111, 216, 157, 0.5)',
                successText: '#83F2C3',
                errorBg: 'rgba(232, 92, 110, 0.18)',
                errorBorder: 'rgba(232, 92, 110, 0.55)',
                errorText: '#FF9AA5',
                infoBg: 'rgba(107, 163, 232, 0.18)',
                infoBorder: 'rgba(139, 185, 240, 0.55)',
                infoText: '#9FC4FF',
                warningBg: 'rgba(255, 183, 77, 0.18)',
                warningBorder: 'rgba(255, 183, 77, 0.55)',
                warningText: '#FFD7A1',
                codeBg: 'rgba(16, 14, 17, 0.94)',
                codeText: '#F4F5F7',
                shadow: 'rgba(0, 0, 0, 0.5)',
                jsonKey: '#9cdcfe',
                jsonString: '#ce9178',
                jsonNumber: '#b5cea8',
                jsonBoolean: '#569cd6',
                jsonNull: '#569cd6',
                jsonBracket: '#d4d4d4'
            };
        } else {
            return {
                bgPrimary: '#FFFFFF',
                bgSecondary: '#F9FAFB',
                bgTertiary: '#EEF2F6',
                bgHighlight: '#F1F5F9',
                bgAccent: '#FFE8F0',
                textPrimary: '#1A1F2E',
                textSecondary: '#6B7588',
                textTertiary: '#A3ADC2',
                borderPrimary: '#D8DCE6',
                borderSecondary: '#E8EBF0',
                borderAccent: '#8B95AA',
                borderSubtle: 'rgba(15, 23, 42, 0.08)',
                accentPrimary: '#CC2D5D',
                accentHover: '#B22651',
                panelBg: 'rgba(255, 255, 255, 0.96)',
                panelBorder: 'rgba(148, 163, 184, 0.24)',
                panelHeaderBg: 'rgba(148, 163, 184, 0.12)',
                panelResponseHeaderBg: 'rgba(148, 163, 184, 0.12)',
                panelInfoBg: 'rgba(248, 250, 252, 0.9)',
                codeSurface: 'rgba(248, 250, 252, 0.95)',
                successBg: '#E8F7EE',
                successBorder: '#4CAF80',
                successText: '#1E7A45',
                errorBg: '#FDEEF0',
                errorBorder: '#E85C6E',
                errorText: '#C1344A',
                infoBg: '#EBF4FF',
                infoBorder: '#6BA3E8',
                infoText: '#2563B5',
                warningBg: '#FFF8E6',
                warningBorder: '#FFB74D',
                warningText: '#E65100',
                codeBg: '#F8FAFC',
                codeText: '#0F172A',
                shadow: 'rgba(15, 23, 42, 0.06)',
                jsonKey: '#9cdcfe',
                jsonString: '#ce9178',
                jsonNumber: '#b5cea8',
                jsonBoolean: '#569cd6',
                jsonNull: '#569cd6',
                jsonBracket: '#d4d4d4'
            };
        }
    };
    
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
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
    const styles = useMemo(() => getPalette(theme), [theme]);
    
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
    
    // Format JSON with simple syntax highlighting
    const formatJson = (obj) => {
        const jsonString = JSON.stringify(obj, null, 2);
        return jsonString
            .replace(/(".*?")\s*:/g, `<span style="color: ${theme === 'dark' ? '#9cdcfe' : '#0451a5'}">$1</span>:`)
            .replace(/:\s*(".*?")/g, `: <span style="color: ${theme === 'dark' ? '#ce9178' : '#a31515'}">$1</span>`)
            .replace(/:\s*(\d+\.?\d*)/g, `: <span style="color: ${theme === 'dark' ? '#b5cea8' : '#098658'}">$1</span>`)
            .replace(/:\s*(true|false|null)/g, `: <span style="color: ${theme === 'dark' ? '#569cd6' : '#0000ff'}">$1</span>`);
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
    
    return (
        <div style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minHeight: '100vh',
            backgroundColor: styles.bgSecondary,
            color: styles.textPrimary,
            padding: '24px 0'
        }}>
            <div style={{ 
                maxWidth: '1440px', 
                margin: '0 auto', 
                padding: windowWidth >= 1024 ? '0 0px' : '0',
                display: 'flex',
                flexDirection: windowWidth >= 768 ? 'row' : 'column',
                gap: windowWidth >= 1024 ? '48px' : windowWidth >= 768 ? '40px' : '32px',
                alignItems: 'flex-start'
            }}>
                {/* Desktop Navigation Sidebar */}
                {windowWidth >= 768 && (
                <nav style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: '64px',
                    height: 'calc(100vh - 64px)',
                    width: '288px',
                    flexShrink: 0,
                    borderRight: `1px solid ${styles.borderPrimary}`,
                    paddingRight: '20px',
                    paddingTop: '45px',
                    paddingBottom: '24px',
                    overflowY: 'auto',
                    alignSelf: 'flex-start',
                    backgroundColor: styles.bgSecondary,
                    zIndex: 10
                }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <p style={{
                                paddingLeft: '16px',
                                marginBottom: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.32em',
                                color: styles.textSecondary
                            }}>
                                Documentation
                            </p>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', listStyle: 'none', padding: 0, margin: 0 }}>
                                {navItems.map(item => {
                                    const locked = isStepLocked(item.id);
                                    const active = activeSection === item.id;
                                    return (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                onClick={(e) => handleNavClick(item.id, e)}
                                                style={{
                                                    display: 'flex',
                                                    width: '100%',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    borderRadius: '12px',
                                                    padding: '8px 16px',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    textDecoration: 'none',
                                                    color: active ? styles.accentPrimary : styles.textSecondary,
                                                    backgroundColor: active ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.1)' : 'rgba(204, 45, 93, 0.1)') : 'transparent',
                                                    fontWeight: active ? '600' : '400',
                                                    opacity: locked ? 0.4 : 1,
                                                    cursor: locked ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!locked && !active) {
                                                        e.target.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                                                        e.target.style.color = styles.textPrimary;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!locked && !active) {
                                                        e.target.style.backgroundColor = 'transparent';
                                                        e.target.style.color = styles.textSecondary;
                                                    }
                                                }}
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
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
                                backgroundColor: styles.bgPrimary,
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                                transition: 'transform 0.3s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                borderBottom: `1px solid ${styles.borderPrimary}`
                            }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.18em',
                                    color: styles.textSecondary
                                }}>
                                    Navigation
                                </h3>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{
                                        fontSize: '24px',
                                        color: styles.textSecondary,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        lineHeight: 1
                                    }}
                                    aria-label="Close Menu"
                                >
                                    ×
                                </button>
                            </div>
                            <ul style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px 0',
                                fontSize: '14px',
                                listStyle: 'none',
                                paddingLeft: 0,
                                margin: 0
                            }}>
                                {navItems.map(item => {
                                    const locked = isStepLocked(item.id);
                                    const active = activeSection === item.id;
                                    return (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                onClick={(e) => handleNavClick(item.id, e)}
                                                style={{
                                                    display: 'block',
                                                    padding: '10px 20px',
                                                    textDecoration: 'none',
                                                    color: active ? styles.accentPrimary : styles.textSecondary,
                                                    backgroundColor: active ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.1)' : 'rgba(204, 45, 93, 0.1)') : 'transparent',
                                                    fontWeight: active ? '600' : '400',
                                                    opacity: locked ? 0.4 : 1,
                                                    cursor: locked ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!locked && !active) {
                                                        e.target.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                                                        e.target.style.color = styles.textPrimary;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!locked && !active) {
                                                        e.target.style.backgroundColor = 'transparent';
                                                        e.target.style.color = styles.textSecondary;
                                                    }
                                                }}
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div style={{ 
                    flex: 1,
                    width: '100%',
                    maxWidth: '768px',
                    margin: windowWidth >= 768 ? '0 410px 0 320px' : '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    paddingLeft: windowWidth >= 768 ? '0' : windowWidth >= 640 ? '24px' : '20px',
                    paddingRight: windowWidth >= 1024 ? '24px' : windowWidth >= 768 ? '0' : windowWidth >= 640 ? '24px' : '20px'
                }}>
                    {/* Mobile Menu Button */}
                    {windowWidth < 768 && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            borderRadius: '6px',
                            border: `1px solid ${styles.borderPrimary}`,
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                            padding: '8px 12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: styles.textPrimary,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginTop: '8px',
                            marginBottom: '40px',
                            width: 'fit-content'
                        }}
                        aria-label="Toggle Navigation Menu"
                    >
                        <span style={{ display: 'block', height: '2px', width: '20px', borderRadius: '1px', backgroundColor: 'currentColor', transition: 'transform 0.3s ease' }}></span>
                        <span style={{ display: 'block', height: '2px', width: '20px', borderRadius: '1px', backgroundColor: 'currentColor', transition: 'opacity 0.3s ease' }}></span>
                        <span style={{ display: 'block', height: '2px', width: '20px', borderRadius: '1px', backgroundColor: 'currentColor', transition: 'transform 0.3s ease' }}></span>
                    </button>
                    )}

                    {/* Header */}
                    <div style={{ marginTop: '8px', marginBottom: '40px' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '9999px',
                        backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: styles.accentPrimary,
                        marginBottom: '12px'
                    }}>
                        Documentation
                    </span>
                    <h1 style={{ 
                        fontSize: '42px', 
                        fontWeight: 'bold', 
                        marginBottom: '12px',
                        color: styles.textPrimary
                    }}>
                        Layerswap Deposit API Tutorial
                    </h1>
                    <p style={{ 
                        fontSize: '18px', 
                        color: styles.textSecondary, 
                        maxWidth: '672px'
                    }}>
                        Interactive guide to integrate cross-chain deposits into your wallet or application.
                    </p>
                </div>

                {/* Overview Section */}
                <div id="overview" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h2 style={{ 
                        fontSize: '24px', 
                        fontWeight: '600',
                        color: styles.textPrimary
                    }}>
                        Accept Deposits from Any Chain, Instantly
                    </h2>
                    <p style={{ 
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: styles.textSecondary
                    }}>
                        Give users a single deposit address. They send from any chain – funds automatically bridge and arrive to your destination. That's it.
                    </p>

                    {/* Stats Cards */}
                    <div style={{
                        marginTop: '24px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '18px',
                            border: `1px solid ${styles.borderPrimary}`,
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                            padding: '20px 24px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <span style={{ fontSize: '30px', fontWeight: '600', color: styles.accentPrimary }}>70+</span>
                            <span style={{ 
                                marginTop: '4px',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.35em',
                                color: styles.textSecondary
                            }}>
                                Networks
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '18px',
                            border: `1px solid ${styles.borderPrimary}`,
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                            padding: '20px 24px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <span style={{ fontSize: '30px', fontWeight: '600', color: styles.accentPrimary }}>&lt;10s</span>
                            <span style={{ 
                                marginTop: '4px',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.35em',
                                color: styles.textSecondary
                            }}>
                                Processing
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '18px',
                            border: `1px solid ${styles.borderPrimary}`,
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                            padding: '20px 24px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <span style={{ fontSize: '30px', fontWeight: '600', color: styles.accentPrimary }}>$1B+</span>
                            <span style={{ 
                                marginTop: '4px',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.35em',
                                color: styles.textSecondary
                            }}>
                                Volume
                            </span>
                        </div>
                    </div>

                    {/* Integration Flow */}
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h3 style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.32em',
                            color: styles.textSecondary
                        }}>
                            Integration Flow
                        </h3>

                        <div style={{ marginLeft: '14px', marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Step 1 */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                    <div style={{
                                        display: 'flex',
                                        height: '28px',
                                        width: '28px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '9999px',
                                        backgroundColor: theme === 'dark' ? styles.bgTertiary : '#FFFFFF',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: styles.accentPrimary,
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        border: `1px solid ${styles.borderPrimary}`
                                    }}>1</div>
                                    <div style={{ marginTop: '8px', height: '100%', width: '1px', backgroundColor: styles.borderSecondary }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: styles.textPrimary }}>Set Your Destination</p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: styles.textSecondary }}>
                                        Configure your wallet address and specify which network and token you want to receive (e.g., USDC on Base, ETH on Arbitrum).
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                    <div style={{
                                        display: 'flex',
                                        height: '28px',
                                        width: '28px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '9999px',
                                        backgroundColor: theme === 'dark' ? styles.bgTertiary : '#FFFFFF',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: styles.accentPrimary,
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        border: `1px solid ${styles.borderPrimary}`
                                    }}>2</div>
                                    <div style={{ marginTop: '8px', height: '100%', width: '1px', backgroundColor: styles.borderSecondary }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: styles.textPrimary }}>Fetch Available Sources</p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: styles.textSecondary }}>
                                        Call GET /sources endpoint – returns all networks and tokens your users can send from to reach your destination (70+ options).
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                    <div style={{
                                        display: 'flex',
                                        height: '28px',
                                        width: '28px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '9999px',
                                        backgroundColor: theme === 'dark' ? styles.bgTertiary : '#FFFFFF',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: styles.accentPrimary,
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        border: `1px solid ${styles.borderPrimary}`
                                    }}>3</div>
                                    <div style={{ marginTop: '8px', height: '100%', width: '1px', backgroundColor: styles.borderSecondary }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: styles.textPrimary }}>User Selects Source</p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: styles.textSecondary }}>
                                        Display the available options to your user and let them choose which network and token they have (e.g., USDT on BSC, ETH on Polygon).
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                    <div style={{
                                        display: 'flex',
                                        height: '28px',
                                        width: '28px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '9999px',
                                        backgroundColor: theme === 'dark' ? styles.bgTertiary : '#FFFFFF',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: styles.accentPrimary,
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        border: `1px solid ${styles.borderPrimary}`
                                    }}>4</div>
                                    <div style={{ marginTop: '8px', height: '100%', width: '1px', backgroundColor: styles.borderSecondary }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: styles.textPrimary }}>Generate Deposit Address</p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: styles.textSecondary }}>
                                        Call POST /swaps with the selected route – the API creates a unique deposit address and handles all bridging logic.
                                    </p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                    <div style={{
                                        display: 'flex',
                                        height: '28px',
                                        width: '28px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '9999px',
                                        backgroundColor: theme === 'dark' ? styles.bgTertiary : '#FFFFFF',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: styles.accentPrimary,
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        border: `1px solid ${styles.borderPrimary}`
                                    }}>5</div>
                                    <div style={{ marginTop: '8px', height: '100%', width: '1px', backgroundColor: styles.borderSecondary }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: styles.textPrimary }}>Display to User</p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: styles.textSecondary }}>
                                        Show the deposit address with clear instructions so the user sends from the source network they selected.
                                    </p>
                                </div>
                            </div>

                            {/* Step 6 */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                    <div style={{
                                        display: 'flex',
                                        height: '28px',
                                        width: '28px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '9999px',
                                        backgroundColor: theme === 'dark' ? styles.bgTertiary : '#FFFFFF',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: styles.accentPrimary,
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        border: `1px solid ${styles.borderPrimary}`
                                    }}>6</div>
                                    <div style={{ marginTop: '8px', height: '100%', width: '1px', backgroundColor: 'transparent' }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: styles.textPrimary }}>Receive Funds</p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: styles.textSecondary }}>
                                        User sends tokens → Layerswap detects the deposit → automatically converts and bridges → delivers to your wallet on the destination network (usually ~10s).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile-Friendly Note */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        borderRadius: '18px',
                        border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                        backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.15)' : 'rgba(204, 45, 93, 0.1)',
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: styles.textPrimary
                    }}>
                        <div style={{ marginTop: '4px', fontSize: '18px', color: styles.accentPrimary }}>
                            📱
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.18em',
                                color: styles.accentPrimary
                            }}>
                                No Wallet Connections Required
                            </div>
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: styles.textSecondary
                            }}>
                                Just a simple deposit address—no WalletConnect, no browser extensions, no popups. Users can send from any wallet app (MetaMask, Trust Wallet, exchange wallets, hardware wallets) using their preferred method. Perfect for mobile users.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    backgroundColor: styles.borderPrimary,
                    margin: '16px 0'
                }}></div>

                {/* Configuration Section */}
                <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: styles.textPrimary
                    }}>
                        Configuration
                    </h2>
                    <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: styles.textSecondary
                    }}>
                        Set up your API credentials to get started.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '16px'
                    }}>
                        {/* Base API URL */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: styles.textPrimary,
                                marginBottom: '4px'
                            }}>
                                Base API URL
                            </label>
                            <input
                                type="text"
                                value={API_BASE}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `1px solid ${styles.borderPrimary}`,
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: styles.textPrimary,
                                    backgroundColor: styles.bgTertiary,
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    cursor: 'not-allowed',
                                    opacity: 0.6
                                }}
                            />
                        </div>

                        {/* API Key */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: styles.textPrimary,
                                marginBottom: '4px'
                            }}>
                                API Key <span style={{ fontSize: '12px', fontWeight: '400', color: styles.textSecondary }}>(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={handleApiKeyChange}
                                placeholder="Optional - for higher rate limits & analytics"
                                aria-label="API Key"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `1px solid ${apiKeyError ? styles.errorBorder : styles.borderPrimary}`,
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: styles.textPrimary,
                                    backgroundColor: styles.bgPrimary,
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    transition: 'border-color 0.2s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = styles.accentPrimary;
                                    e.target.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(204, 45, 93, 0.3)' : 'rgba(204, 45, 93, 0.2)'}`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = apiKeyError ? styles.errorBorder : styles.borderPrimary;
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            {apiKeyError && (
                                <div style={{
                                    color: styles.errorText,
                                    fontSize: '12px',
                                    marginTop: '4px'
                                }}>
                                    {apiKeyError}
                                </div>
                            )}
                            <small style={{
                                display: 'block',
                                fontSize: '12px',
                                lineHeight: '1.6',
                                color: styles.textSecondary,
                                marginTop: '4px'
                            }}>
                                No API key needed for basic usage. Get one at{' '}
                                <a
                                    href="https://www.layerswap.io/dashboard"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: styles.accentPrimary,
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                >
                                    layerswap.io/dashboard
                                </a>
                                {' '}for higher rate limits and analytics.
                            </small>
                        </div>
                    </div>
                </div>

                {/* Step 1: Setup Destination */}
                <div 
                    id="step1"
                    ref={step1Ref}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px',
                        borderBottom: `1px solid ${styles.borderPrimary}`,
                        paddingBottom: '40px',
                        marginBottom: '48px',
                        scrollMarginTop: '96px',
                        opacity: 1
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '9999px',
                            border: `1px solid ${styles.borderPrimary}`,
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.35em',
                            color: styles.accentPrimary,
                            width: 'fit-content'
                        }}>
                            Step 1:
                        </span>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: styles.textPrimary
                        }}>
                            Setup Destination
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: styles.textSecondary
                        }}>
                            Configure your destination wallet and select the appropriate integration mode for your use case.
                        </p>

                        {/* Mode Selector */}
                        <div style={{
                            borderRadius: '18px',
                            border: `1px solid ${styles.borderPrimary}`,
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                            padding: '16px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <span style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: styles.textPrimary,
                                marginBottom: '16px'
                            }}>
                                Select Your Use Case:
                            </span>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '12px'
                            }}>
                                <label style={{
                                    position: 'relative',
                                    display: 'flex',
                                    cursor: 'pointer',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    borderRadius: '12px',
                                    border: `1px solid ${tokenMode === 'single' ? styles.accentPrimary : styles.borderPrimary}`,
                                    backgroundColor: tokenMode === 'single' 
                                        ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.1)' : 'rgba(204, 45, 93, 0.05)')
                                        : (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'),
                                    padding: '16px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <input
                                        type="radio"
                                        name="tokenMode"
                                        value="single"
                                        checked={tokenMode === 'single'}
                                        onChange={handleModeChange}
                                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                                    />
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: tokenMode === 'single' ? styles.accentPrimary : styles.textPrimary,
                                        transition: 'color 0.2s ease'
                                    }}>
                                        Fixed Destination Token
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        lineHeight: '1.6',
                                        color: tokenMode === 'single' ? styles.accentPrimary : styles.textSecondary,
                                        transition: 'color 0.2s ease'
                                    }}>
                                        <strong style={{ fontWeight: '600' }}>DApp Integration:</strong> For prediction markets, DEXs, or apps requiring a specific token (e.g., only USDC)
                                    </span>
                                </label>
                                <label style={{
                                    position: 'relative',
                                    display: 'flex',
                                    cursor: 'pointer',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    borderRadius: '12px',
                                    border: `1px solid ${tokenMode === 'multiple' ? styles.accentPrimary : styles.borderPrimary}`,
                                    backgroundColor: tokenMode === 'multiple' 
                                        ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.1)' : 'rgba(204, 45, 93, 0.05)')
                                        : (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'),
                                    padding: '16px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <input
                                        type="radio"
                                        name="tokenMode"
                                        value="multiple"
                                        checked={tokenMode === 'multiple'}
                                        onChange={handleModeChange}
                                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                                    />
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: tokenMode === 'multiple' ? styles.accentPrimary : styles.textPrimary,
                                        transition: 'color 0.2s ease'
                                    }}>
                                        Multiple Destination Tokens
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        lineHeight: '1.6',
                                        color: tokenMode === 'multiple' ? styles.accentPrimary : styles.textSecondary,
                                        transition: 'color 0.2s ease'
                                    }}>
                                        <strong style={{ fontWeight: '600' }}>Wallet Integration:</strong> Accept various tokens and deliver their respective counterparts on your network
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Destination Fields */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '16px'
                        }}>
                            {/* Wallet Address */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: styles.textPrimary,
                                    marginBottom: '4px'
                                }}>
                                    Your Wallet Address <span style={{ color: styles.accentPrimary }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={walletAddress}
                                    onChange={handleWalletAddressChange}
                                    placeholder="0x..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: `1px solid ${walletAddressError ? styles.errorBorder : styles.borderPrimary}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: styles.textPrimary,
                                        backgroundColor: styles.bgPrimary,
                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                        transition: 'border-color 0.2s ease',
                                        outline: 'none',
                                        minHeight: '44px'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = styles.accentPrimary;
                                        e.target.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(204, 45, 93, 0.3)' : 'rgba(204, 45, 93, 0.2)'}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = walletAddressError ? styles.errorBorder : styles.borderPrimary;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                {walletAddressError && (
                                    <div style={{
                                        color: styles.errorText,
                                        fontSize: '12px',
                                        marginTop: '4px'
                                    }}>
                                        {walletAddressError}
                                    </div>
                                )}
                            </div>

                            {/* Destination Network Dropdown */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} ref={destinationNetworkDropdownRef}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: styles.textPrimary,
                                    marginBottom: '4px'
                                }}>
                                    Destination Network <span style={{ color: styles.accentPrimary }}>*</span>
                                </label>
                                <div
                                    onClick={() => setDestinationNetworkDropdownOpen(!destinationNetworkDropdownOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderRadius: '8px',
                                        border: `1px solid ${styles.borderPrimary}`,
                                        backgroundColor: styles.bgPrimary,
                                        padding: '12px 16px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: styles.textPrimary,
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s ease',
                                        minHeight: '44px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.borderColor = styles.accentPrimary}
                                    onMouseLeave={(e) => e.target.style.borderColor = styles.borderPrimary}
                                >
                                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '12px' }}>
                                        {selectedNetworkDisplay || 'Select a network'}
                                    </span>
                                    <svg 
                                        width="12" 
                                        height="8" 
                                        viewBox="0 0 12 8" 
                                        fill="none"
                                        style={{
                                            transform: destinationNetworkDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                            flexShrink: 0,
                                            color: styles.textSecondary
                                        }}
                                    >
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                {destinationNetworkDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 40,
                                        marginTop: '8px',
                                        width: '100%',
                                        maxWidth: '448px',
                                        borderRadius: '12px',
                                        border: `1px solid ${styles.borderPrimary}`,
                                        backgroundColor: styles.bgPrimary,
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                        maxHeight: '400px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <div style={{
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10,
                                            borderBottom: `1px solid ${styles.borderPrimary}`,
                                            backgroundColor: styles.bgPrimary,
                                            padding: '12px'
                                        }}>
                                            <input
                                                type="text"
                                                value={networkSearchTerm}
                                                onChange={(e) => setNetworkSearchTerm(e.target.value)}
                                                placeholder="Search networks..."
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${styles.borderPrimary}`,
                                                    backgroundColor: styles.bgPrimary,
                                                    padding: '8px 12px',
                                                    fontSize: '14px',
                                                    color: styles.textPrimary,
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = styles.accentPrimary;
                                                    e.target.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(204, 45, 93, 0.3)' : 'rgba(204, 45, 93, 0.2)'}`;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = styles.borderPrimary;
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            overflowY: 'auto',
                                            maxHeight: '350px',
                                            padding: '8px 0'
                                        }}>
                                            {featuredNetworks.length > 0 && (
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{
                                                        padding: '0 16px 8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.35em',
                                                        color: styles.textSecondary
                                                    }}>
                                                        Featured Networks
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {featuredNetworks.filter(n => 
                                                            !networkSearchTerm || 
                                                            (n.display_name || n.name).toLowerCase().includes(networkSearchTerm.toLowerCase())
                                                        ).map(network => (
                                                            <div
                                                                key={network.name}
                                                                onClick={() => {
                                                                    setDestinationNetwork(network.name);
                                                                    if (network.tokens && network.tokens.length > 0) {
                                                                        setDestinationToken(network.tokens[0].symbol);
                                                                    }
                                                                    setDestinationNetworkDropdownOpen(false);
                                                                    setNetworkSearchTerm('');
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    borderRadius: '8px',
                                                                    padding: '8px 16px',
                                                                    fontSize: '14px',
                                                                    color: destinationNetwork === network.name ? styles.accentPrimary : styles.textPrimary,
                                                                    backgroundColor: destinationNetwork === network.name 
                                                                        ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)')
                                                                        : 'transparent',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (destinationNetwork !== network.name) {
                                                                        e.target.style.backgroundColor = styles.bgHighlight;
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (destinationNetwork !== network.name) {
                                                                        e.target.style.backgroundColor = 'transparent';
                                                                    }
                                                                }}
                                                            >
                                                                {network.logo && (
                                                                    <img
                                                                        src={network.logo}
                                                                        alt={network.display_name || network.name}
                                                                        style={{
                                                                            width: '24px',
                                                                            height: '24px',
                                                                            borderRadius: '50%',
                                                                            objectFit: 'contain'
                                                                        }}
                                                                        onError={(e) => e.target.style.display = 'none'}
                                                                    />
                                                                )}
                                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {network.display_name || formatNetworkName(network.name)}
                                                                </span>
                                                                <span style={{ fontSize: '12px', color: '#fbbf24' }}>★</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <div style={{
                                                    padding: '0 16px 8px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.35em',
                                                    color: styles.textSecondary
                                                }}>
                                                    All Networks
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {filteredNetworks.map(network => (
                                                        <div
                                                            key={network.name}
                                                            onClick={() => {
                                                                setDestinationNetwork(network.name);
                                                                if (network.tokens && network.tokens.length > 0) {
                                                                    setDestinationToken(network.tokens[0].symbol);
                                                                }
                                                                setDestinationNetworkDropdownOpen(false);
                                                                setNetworkSearchTerm('');
                                                            }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                borderRadius: '8px',
                                                                padding: '8px 16px',
                                                                fontSize: '14px',
                                                                color: destinationNetwork === network.name ? styles.accentPrimary : styles.textPrimary,
                                                                backgroundColor: destinationNetwork === network.name 
                                                                    ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)')
                                                                    : 'transparent',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (destinationNetwork !== network.name) {
                                                                    e.target.style.backgroundColor = styles.bgHighlight;
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (destinationNetwork !== network.name) {
                                                                    e.target.style.backgroundColor = 'transparent';
                                                                }
                                                            }}
                                                        >
                                                            {network.logo && (
                                                                <img
                                                                    src={network.logo}
                                                                    alt={network.display_name || network.name}
                                                                    style={{
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        borderRadius: '50%',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            )}
                                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {network.display_name || formatNetworkName(network.name)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Destination Token Dropdown (Single Mode Only) */}
                            {tokenMode === 'single' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} ref={destinationTokenDropdownRef}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: styles.textPrimary,
                                        marginBottom: '4px'
                                    }}>
                                        Destination Token <span style={{ color: styles.accentPrimary }}>*</span>
                                    </label>
                                    <div
                                        onClick={() => setDestinationTokenDropdownOpen(!destinationTokenDropdownOpen)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            borderRadius: '8px',
                                            border: `1px solid ${styles.borderPrimary}`,
                                            backgroundColor: styles.bgPrimary,
                                            padding: '12px 16px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: styles.textPrimary,
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s ease',
                                            minHeight: '44px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.borderColor = styles.accentPrimary}
                                        onMouseLeave={(e) => e.target.style.borderColor = styles.borderPrimary}
                                    >
                                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '12px' }}>
                                            {destinationToken || 'Select a token'}
                                        </span>
                                        <svg 
                                            width="12" 
                                            height="8" 
                                            viewBox="0 0 12 8" 
                                            fill="none"
                                            style={{
                                                transform: destinationTokenDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s ease',
                                                flexShrink: 0,
                                                color: styles.textSecondary
                                            }}
                                        >
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    {destinationTokenDropdownOpen && selectedNetworkTokens.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            zIndex: 40,
                                            marginTop: '8px',
                                            width: '100%',
                                            maxWidth: '448px',
                                            borderRadius: '12px',
                                            border: `1px solid ${styles.borderPrimary}`,
                                            backgroundColor: styles.bgPrimary,
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                            maxHeight: '400px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <div style={{
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 10,
                                                borderBottom: `1px solid ${styles.borderPrimary}`,
                                                backgroundColor: styles.bgPrimary,
                                                padding: '12px'
                                            }}>
                                                <input
                                                    type="text"
                                                    value={tokenSearchTerm}
                                                    onChange={(e) => setTokenSearchTerm(e.target.value)}
                                                    placeholder="Search tokens..."
                                                    style={{
                                                        width: '100%',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${styles.borderPrimary}`,
                                                        backgroundColor: styles.bgPrimary,
                                                        padding: '8px 12px',
                                                        fontSize: '14px',
                                                        color: styles.textPrimary,
                                                        outline: 'none',
                                                        transition: 'border-color 0.2s ease'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = styles.accentPrimary;
                                                        e.target.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(204, 45, 93, 0.3)' : 'rgba(204, 45, 93, 0.2)'}`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = styles.borderPrimary;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </div>
                                            <div style={{
                                                overflowY: 'auto',
                                                maxHeight: '350px',
                                                padding: '8px 0'
                                            }}>
                                                {filteredTokens.map(token => (
                                                    <div
                                                        key={token.symbol}
                                                        onClick={() => {
                                                            setDestinationToken(token.symbol);
                                                            setDestinationTokenDropdownOpen(false);
                                                            setTokenSearchTerm('');
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            borderRadius: '8px',
                                                            padding: '8px 16px',
                                                            fontSize: '14px',
                                                            color: destinationToken === token.symbol ? styles.accentPrimary : styles.textPrimary,
                                                            backgroundColor: destinationToken === token.symbol 
                                                                ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)')
                                                                : 'transparent',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (destinationToken !== token.symbol) {
                                                                e.target.style.backgroundColor = styles.bgHighlight;
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (destinationToken !== token.symbol) {
                                                                e.target.style.backgroundColor = 'transparent';
                                                            }
                                                        }}
                                                    >
                                                        {token.logo && (
                                                            <img
                                                                src={token.logo}
                                                                alt={token.symbol || token.display_asset}
                                                                style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    objectFit: 'contain'
                                                                }}
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        )}
                                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {token.symbol || token.display_asset}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Step 2: Select Source */}
                <div 
                    id="step2"
                    ref={step2Ref}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px',
                        borderBottom: `1px solid ${styles.borderPrimary}`,
                        paddingBottom: '40px',
                        marginBottom: '48px',
                        scrollMarginTop: '96px',
                        opacity: step2Locked ? 0.35 : 1,
                        pointerEvents: step2Locked ? 'none' : 'auto',
                        filter: step2Locked ? 'grayscale(50%)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '9999px',
                            border: `1px solid ${styles.borderPrimary}`,
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.35em',
                            color: styles.accentPrimary,
                            width: 'fit-content'
                        }}>
                            Step 2:
                        </span>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: styles.textPrimary
                        }}>
                            Select Source
                        </h2>
                        {tokenMode === 'single' ? (
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: styles.textSecondary
                            }}>
                                Select which networks can send tokens to receive{' '}
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                    backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.18em',
                                    color: styles.accentPrimary
                                }}>
                                    {destinationToken} on {selectedNetworkDisplay}
                                </span>
                                {' '}on your network.
                            </p>
                        ) : (
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: styles.textSecondary
                            }}>
                                Select the source network and token - users will receive the matching token on your destination network.
                            </p>
                        )}

                        {/* API Hint */}
                        <div style={{
                            marginTop: '12px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            borderRadius: '8px',
                            border: `1px solid ${styles.borderPrimary}`,
                            backgroundColor: styles.bgHighlight,
                            padding: '8px 12px',
                            fontSize: '12px',
                            lineHeight: '1.6',
                            color: styles.textSecondary
                        }}>
                            <span style={{ fontSize: '14px', color: styles.accentPrimary, flexShrink: 0 }}>ℹ️</span>
                            <span>
                                The <code style={{
                                    borderRadius: '4px',
                                    backgroundColor: styles.bgTertiary,
                                    padding: '2px 4px',
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    color: styles.accentPrimary
                                }}>has_deposit_address=true</code> parameter ensures we only show sources that support generating deposit addresses, which is essential for the deposit flow.
                            </span>
                        </div>

                        {/* Get Sources Button */}
                        <button
                            onClick={handleGetSources}
                            disabled={step2Locked || isLoadingStep2}
                            aria-label="Fetch available source networks"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                backgroundColor: step2Locked ? styles.borderPrimary : styles.accentPrimary,
                                color: step2Locked ? styles.textTertiary : styles.bgPrimary,
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: step2Locked ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                marginTop: '12px'
                            }}
                            onMouseEnter={(e) => {
                                if (!step2Locked) {
                                    e.target.style.backgroundColor = styles.accentHover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!step2Locked) {
                                    e.target.style.backgroundColor = styles.accentPrimary;
                                }
                            }}
                        >
                            {isLoadingStep2 ? 'Loading...' : 'Get Sources'}
                        </button>

                        {/* Result Box */}
                        {step2Result.visible && (
                            <div style={{
                                marginTop: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${step2Result.variant === 'success' ? styles.successBorder : step2Result.variant === 'error' ? styles.errorBorder : styles.borderPrimary}`,
                                backgroundColor: step2Result.variant === 'success' ? styles.successBg : step2Result.variant === 'error' ? styles.errorBg : styles.bgPrimary,
                                padding: '12px 16px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: step2Result.variant === 'success' ? styles.successText : step2Result.variant === 'error' ? styles.errorText : styles.textPrimary,
                                wordWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}>
                                {step2Result.message}
                            </div>
                        )}

                        {/* Source Networks Grid */}
                        {showSourceNetworks && sources.length > 0 && (
                            <div style={{
                                marginTop: '16px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                                gap: '12px'
                            }}>
                                {sources.map((source) => {
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
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                borderRadius: '12px',
                                                border: `1px solid ${isSelected ? styles.accentPrimary : styles.borderPrimary}`,
                                                backgroundColor: isSelected 
                                                    ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)')
                                                    : (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'),
                                                padding: '16px',
                                                textAlign: 'left',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: isSelected ? styles.accentPrimary : styles.textPrimary,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.target.style.borderColor = styles.accentPrimary;
                                                    e.target.style.backgroundColor = theme === 'dark' ? 'rgba(204, 45, 93, 0.1)' : 'rgba(204, 45, 93, 0.05)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.target.style.borderColor = styles.borderPrimary;
                                                    e.target.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)';
                                                }
                                            }}
                                        >
                                            {source.logo && (
                                                <img
                                                    src={source.logo}
                                                    alt={shortName}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        objectFit: 'contain',
                                                        backgroundColor: styles.bgSecondary,
                                                        padding: '2px'
                                                    }}
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            )}
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: 'inherit'
                                            }}>
                                                {shortName}
                                            </span>
                                            {source.tokens && source.tokens.length > 0 && (
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '500',
                                                    color: styles.textSecondary
                                                }}>
                                                    {source.tokens.slice(0, 3).join(', ')}{source.tokens.length > 3 ? '...' : ''}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Token Selector (Multiple Mode) */}
                        {tokenMode === 'multiple' && showSourceTokenSelector && networkMap[sourceNetwork] && (
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: styles.textPrimary,
                                    marginBottom: '4px'
                                }}>
                                    Source Token <span style={{ color: styles.accentPrimary }}>*</span>
                                </label>
                                <select
                                    value={sourceToken}
                                    onChange={handleSourceTokenSelect}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: `1px solid ${styles.borderPrimary}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: styles.textPrimary,
                                        backgroundColor: styles.bgPrimary,
                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                        transition: 'border-color 0.2s ease',
                                        outline: 'none',
                                        minHeight: '44px',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = styles.accentPrimary;
                                        e.target.style.boxShadow = `0 0 0 2px ${theme === 'dark' ? 'rgba(204, 45, 93, 0.3)' : 'rgba(204, 45, 93, 0.2)'}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = styles.borderPrimary;
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
                            <div style={{
                                borderRadius: '12px',
                                border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                padding: '12px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: styles.textSecondary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ fontWeight: '600', color: styles.textPrimary }}>Selected:</span>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                    backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.18em',
                                    color: styles.accentPrimary
                                }}>
                                    {sourceNetwork.replace(/_/g, ' ')}
                                </span>
                                {sourceToken && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        borderRadius: '8px',
                                        border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                        backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.accentPrimary
                                    }}>
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
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '32px',
                            borderBottom: `1px solid ${styles.borderPrimary}`,
                            paddingBottom: '40px',
                            marginBottom: '48px',
                            scrollMarginTop: '96px',
                            opacity: step3DestinationLocked ? 0.35 : 1,
                            pointerEvents: step3DestinationLocked ? 'none' : 'auto',
                            filter: step3DestinationLocked ? 'grayscale(50%)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '9999px',
                                border: `1px solid ${styles.borderPrimary}`,
                                padding: '4px 12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.35em',
                                color: styles.accentPrimary,
                                width: 'fit-content'
                            }}>
                                Step 3:
                            </span>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: styles.textPrimary
                            }}>
                                Select Destination
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: styles.textSecondary
                            }}>
                                After the user selects a source, use the destinations endpoint to determine the token they'll receive on{' '}
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                    backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.18em',
                                    color: styles.accentPrimary
                                }}>
                                    {selectedNetworkDisplay}
                                </span>
                                .
                            </p>

                            {/* Get Available Tokens Button */}
                            <button
                                onClick={handleGetDestinationTokens}
                                disabled={step3DestinationLocked || isLoadingStep3Destination}
                                aria-label="Fetch available destination tokens"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '8px',
                                    backgroundColor: step3DestinationLocked ? styles.borderPrimary : styles.accentPrimary,
                                    color: step3DestinationLocked ? styles.textTertiary : styles.bgPrimary,
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: step3DestinationLocked ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    marginTop: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!step3DestinationLocked) {
                                        e.target.style.backgroundColor = styles.accentHover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!step3DestinationLocked) {
                                        e.target.style.backgroundColor = styles.accentPrimary;
                                    }
                                }}
                            >
                                {isLoadingStep3Destination ? 'Loading...' : 'Get Available Tokens'}
                            </button>

                            {/* Result Box */}
                            {step3DestinationResult.visible && (
                                <div style={{
                                    marginTop: '16px',
                                    borderRadius: '12px',
                                    border: `1px solid ${step3DestinationResult.variant === 'success' ? styles.successBorder : step3DestinationResult.variant === 'error' ? styles.errorBorder : styles.borderPrimary}`,
                                    backgroundColor: step3DestinationResult.variant === 'success' ? styles.successBg : step3DestinationResult.variant === 'error' ? styles.errorBg : styles.bgPrimary,
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    color: step3DestinationResult.variant === 'success' ? styles.successText : step3DestinationResult.variant === 'error' ? styles.errorText : styles.textPrimary,
                                    wordWrap: 'break-word',
                                    wordBreak: 'break-word'
                                }}>
                                    {step3DestinationResult.message}
                                </div>
                            )}

                            {/* Destination Tokens Grid */}
                            {showDestinationTokens && tokens.length > 0 && (
                                <div style={{
                                    marginTop: '16px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {tokens.map((token) => {
                                        const tokenSymbol = token.symbol || token.display_asset || token;
                                        const isSelected = destinationTokenMultiple === tokenSymbol;
                                        
                                        return (
                                            <button
                                                key={tokenSymbol}
                                                type="button"
                                                onClick={() => selectDestinationToken(tokenSymbol)}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isSelected ? styles.accentPrimary : styles.borderPrimary}`,
                                                    backgroundColor: isSelected 
                                                        ? (theme === 'dark' ? 'rgba(204, 45, 93, 0.25)' : 'rgba(204, 45, 93, 0.15)')
                                                        : (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'),
                                                    padding: '12px 16px',
                                                    textAlign: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: isSelected ? styles.accentPrimary : styles.textPrimary,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) {
                                                        e.target.style.borderColor = styles.accentPrimary;
                                                        e.target.style.backgroundColor = theme === 'dark' ? 'rgba(204, 45, 93, 0.1)' : 'rgba(204, 45, 93, 0.05)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) {
                                                        e.target.style.borderColor = styles.borderPrimary;
                                                        e.target.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)';
                                                    }
                                                }}
                                            >
                                                {token.logo && (
                                                    <img
                                                        src={token.logo}
                                                        alt={tokenSymbol}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            objectFit: 'contain',
                                                            backgroundColor: styles.bgSecondary,
                                                            padding: '2px'
                                                        }}
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                )}
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: 'inherit'
                                                }}>
                                                    {tokenSymbol}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Selected Destination Token Info */}
                            {showSelectedDestTokenInfo && destinationTokenMultiple && (
                                <div style={{
                                    borderRadius: '12px',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                    backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: styles.textSecondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontWeight: '600', color: styles.textPrimary }}>Selected:</span>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        borderRadius: '8px',
                                        border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                        backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.accentPrimary
                                    }}>
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
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px',
                        borderBottom: `1px solid ${styles.borderPrimary}`,
                        paddingBottom: '40px',
                        marginBottom: '48px',
                        scrollMarginTop: '96px',
                        opacity: step3Locked ? 0.35 : 1,
                        pointerEvents: step3Locked ? 'none' : 'auto',
                        filter: step3Locked ? 'grayscale(50%)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '9999px',
                            border: `1px solid ${styles.borderPrimary}`,
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.35em',
                            color: styles.accentPrimary,
                            width: 'fit-content'
                        }}>
                            {tokenMode === 'multiple' ? 'Step 4:' : 'Step 3:'}
                        </span>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: styles.textPrimary
                        }}>
                            Get Quote (Optional)
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: styles.textSecondary
                        }}>
                            Get a detailed quote for bridging from{' '}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                borderRadius: '8px',
                                border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.18em',
                                color: styles.accentPrimary
                            }}>
                                {sourceNetwork ? `${sourceNetwork.replace(/_/g, ' ')} (${sourceToken})` : 'your selected network'}
                            </span>
                            {' '}to{' '}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                borderRadius: '8px',
                                border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.18em',
                                color: styles.accentPrimary
                            }}>
                                {selectedNetworkDisplay} ({tokenMode === 'single' ? destinationToken : destinationTokenMultiple || 'token'})
                            </span>
                            .
                        </p>
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: styles.textSecondary,
                            marginTop: '8px'
                        }}>
                            <strong>Note:</strong> Getting a quote is optional for creating a swap, but recommended to show users the exact fees, limits, and estimated processing time before they deposit.
                        </p>

                        {/* Get Quote Button */}
                        <button
                            onClick={handleGetQuote}
                            disabled={step3Locked || isLoadingStep3}
                            aria-label="Get detailed transfer quote"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                backgroundColor: step3Locked ? styles.borderPrimary : styles.accentPrimary,
                                color: step3Locked ? styles.textTertiary : styles.bgPrimary,
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: step3Locked ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                marginTop: '12px'
                            }}
                            onMouseEnter={(e) => {
                                if (!step3Locked) {
                                    e.target.style.backgroundColor = styles.accentHover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!step3Locked) {
                                    e.target.style.backgroundColor = styles.accentPrimary;
                                }
                            }}
                        >
                            {isLoadingStep3 ? 'Loading...' : 'Get Detailed Quote'}
                        </button>

                        {/* Result Box */}
                        {step3Result.visible && (
                            <div style={{
                                marginTop: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${step3Result.variant === 'success' ? styles.successBorder : step3Result.variant === 'error' ? styles.errorBorder : styles.borderPrimary}`,
                                backgroundColor: step3Result.variant === 'success' ? styles.successBg : step3Result.variant === 'error' ? styles.errorBg : styles.bgPrimary,
                                padding: '12px 16px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: step3Result.variant === 'success' ? styles.successText : step3Result.variant === 'error' ? styles.errorText : styles.textPrimary,
                                wordWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}>
                                {step3Result.message}
                            </div>
                        )}

                        {/* Quote Details */}
                        {showQuoteDetails && quotes.length > 0 && (
                            <div style={{
                                marginTop: '16px',
                                borderRadius: '18px',
                                border: `1px solid ${styles.borderPrimary}`,
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}>
                                {quotes.length > 1 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <h4 style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: styles.textPrimary
                                        }}>
                                            Available Routes
                                        </h4>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                            <div
                                                key={index}
                                                style={{
                                                    borderRadius: '18px',
                                                    border: `1px solid ${styles.borderPrimary}`,
                                                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                                                    padding: '16px',
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                                }}
                                            >
                                                {/* Routing Path */}
                                                {quote.path && quote.path.length > 0 && (
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <p style={{
                                                            marginBottom: '8px',
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.32em',
                                                            color: styles.textSecondary
                                                        }}>
                                                            Routing Path
                                                        </p>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            color: styles.textPrimary
                                                        }}>
                                                            {quote.path.map((step, pathIndex) => (
                                                                <div key={pathIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <span style={{
                                                                        borderRadius: '6px',
                                                                        backgroundColor: styles.bgHighlight,
                                                                        padding: '4px 10px',
                                                                        fontSize: '11px',
                                                                        fontWeight: '500',
                                                                        color: styles.textPrimary
                                                                    }}>
                                                                        {step.provider_name}
                                                                    </span>
                                                                    {pathIndex < quote.path.length - 1 && (
                                                                        <span style={{ color: styles.textSecondary }}>→</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Amount Range and Processing Time */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                    gap: '16px',
                                                    marginBottom: '16px'
                                                }}>
                                                    <div>
                                                        <p style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.32em',
                                                            color: styles.textSecondary,
                                                            marginBottom: '4px'
                                                        }}>
                                                            Amount Range
                                                        </p>
                                                        <p style={{
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            color: styles.textPrimary
                                                        }}>
                                                            {minAmount} - {maxAmount} {sourceToken}
                                                        </p>
                                                        {usdRange && (
                                                            <p style={{
                                                                marginTop: '4px',
                                                                fontSize: '11px',
                                                                color: styles.textSecondary
                                                            }}>
                                                                {usdRange}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.32em',
                                                            color: styles.textSecondary,
                                                            marginBottom: '4px'
                                                        }}>
                                                            Processing Time
                                                        </p>
                                                        <p style={{
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            color: styles.textPrimary
                                                        }}>
                                                            {timeDisplay}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Fee Cards */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                                    gap: '12px'
                                                }}>
                                                    <div style={{
                                                        borderRadius: '12px',
                                                        backgroundColor: styles.bgHighlight,
                                                        padding: '12px',
                                                        fontSize: '12px',
                                                        color: styles.textPrimary
                                                    }}>
                                                        <p style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.32em',
                                                            color: styles.textSecondary,
                                                            marginBottom: '4px'
                                                        }}>
                                                            MIN FEE
                                                        </p>
                                                        <p style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: styles.textPrimary
                                                        }}>
                                                            {feeForMin} {sourceToken}
                                                        </p>
                                                        {feeForMinUsd && (
                                                            <p style={{
                                                                marginTop: '4px',
                                                                fontSize: '11px',
                                                                color: styles.textSecondary
                                                            }}>
                                                                ≈ ${feeForMinUsd}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div style={{
                                                        borderRadius: '12px',
                                                        backgroundColor: styles.bgHighlight,
                                                        padding: '12px',
                                                        fontSize: '12px',
                                                        color: styles.textPrimary
                                                    }}>
                                                        <p style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.32em',
                                                            color: styles.textSecondary,
                                                            marginBottom: '4px'
                                                        }}>
                                                            MAX FEE
                                                        </p>
                                                        <p style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: styles.textPrimary
                                                        }}>
                                                            {feeForMax} {sourceToken}
                                                        </p>
                                                        {feeForMaxUsd && (
                                                            <p style={{
                                                                marginTop: '4px',
                                                                fontSize: '11px',
                                                                color: styles.textSecondary
                                                            }}>
                                                                ≈ ${feeForMaxUsd}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div style={{
                                                        borderRadius: '12px',
                                                        backgroundColor: styles.bgHighlight,
                                                        padding: '12px',
                                                        fontSize: '12px',
                                                        color: styles.textPrimary
                                                    }}>
                                                        <p style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.32em',
                                                            color: styles.textSecondary,
                                                            marginBottom: '4px'
                                                        }}>
                                                            FEE STRUCTURE
                                                        </p>
                                                        <p style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: styles.textPrimary
                                                        }}>
                                                            {feeStructureText}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Swap Request Fields */}
                        {showSwapRequestFields && (
                            <div style={{
                                borderRadius: '18px',
                                border: `1px solid ${styles.borderPrimary}`,
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                                padding: '16px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                marginTop: '16px'
                            }}>
                                <h4 style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.35em',
                                    color: styles.textSecondary,
                                    marginBottom: '16px'
                                }}>
                                    Request Body
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '12px',
                                    fontSize: '12px',
                                    color: styles.textPrimary
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            color: styles.textSecondary
                                        }}>
                                            source_network
                                        </div>
                                        <div style={{
                                            borderRadius: '8px',
                                            backgroundColor: styles.bgHighlight,
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.textPrimary
                                        }}>
                                            {sourceNetwork}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            color: styles.textSecondary
                                        }}>
                                            source_token
                                        </div>
                                        <div style={{
                                            borderRadius: '8px',
                                            backgroundColor: styles.bgHighlight,
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.textPrimary
                                        }}>
                                            {sourceToken}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            color: styles.textSecondary
                                        }}>
                                            destination_network
                                        </div>
                                        <div style={{
                                            borderRadius: '8px',
                                            backgroundColor: styles.bgHighlight,
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.textPrimary
                                        }}>
                                            {destinationNetwork}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            color: styles.textSecondary
                                        }}>
                                            destination_token
                                        </div>
                                        <div style={{
                                            borderRadius: '8px',
                                            backgroundColor: styles.bgHighlight,
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.textPrimary
                                        }}>
                                            {tokenMode === 'single' ? destinationToken : destinationTokenMultiple}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            color: styles.textSecondary
                                        }}>
                                            destination_address
                                        </div>
                                        <div style={{
                                            borderRadius: '8px',
                                            backgroundColor: styles.bgHighlight,
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.textPrimary,
                                            wordBreak: 'break-all'
                                        }}>
                                            {walletAddress}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            color: styles.textSecondary
                                        }}>
                                            refuel
                                        </div>
                                        <div style={{
                                            borderRadius: '8px',
                                            backgroundColor: styles.bgHighlight,
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.textPrimary
                                        }}>
                                            false
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            color: styles.textSecondary
                                        }}>
                                            use_deposit_address
                                        </div>
                                        <div style={{
                                            borderRadius: '8px',
                                            backgroundColor: styles.bgHighlight,
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.textPrimary
                                        }}>
                                            true
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    marginTop: '12px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 183, 77, 0.4)' : 'rgba(255, 183, 77, 0.2)'}`,
                                    backgroundColor: theme === 'dark' ? 'rgba(255, 183, 77, 0.1)' : 'rgba(255, 183, 77, 0.05)',
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    color: theme === 'dark' ? styles.warningText : '#E65100'
                                }}>
                                    <span style={{ fontSize: '14px', flexShrink: 0 }}>⚠️</span>
                                    <span>
                                        <strong>Important:</strong> The <code style={{
                                            borderRadius: '4px',
                                            backgroundColor: theme === 'dark' ? 'rgba(255, 183, 77, 0.1)' : 'rgba(255, 255, 255, 0.4)',
                                            padding: '2px 4px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: 'inherit'
                                        }}>use_deposit_address: true</code> parameter is critical for this API flow. When set to true, the swap response will include a deposit address that users can send funds to from any supported chain.
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
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px',
                        borderBottom: `1px solid ${styles.borderPrimary}`,
                        paddingBottom: '40px',
                        marginBottom: '48px',
                        scrollMarginTop: '96px',
                        opacity: step4Locked ? 0.35 : 1,
                        pointerEvents: step4Locked ? 'none' : 'auto',
                        filter: step4Locked ? 'grayscale(50%)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '9999px',
                            border: `1px solid ${styles.borderPrimary}`,
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.35em',
                            color: styles.accentPrimary,
                            width: 'fit-content'
                        }}>
                            {tokenMode === 'multiple' ? 'Step 5:' : 'Step 4:'}
                        </span>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: styles.textPrimary
                        }}>
                            Create Swap
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: styles.textSecondary
                        }}>
                            Create a swap to get your unique deposit address.
                        </p>

                        {/* Create Swap Button */}
                        <button
                            onClick={handleCreateSwap}
                            disabled={step4Locked || isLoadingStep4}
                            aria-label="Create a new swap transaction"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                backgroundColor: step4Locked ? styles.borderPrimary : styles.accentPrimary,
                                color: step4Locked ? styles.textTertiary : styles.bgPrimary,
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: step4Locked ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                marginTop: '12px'
                            }}
                            onMouseEnter={(e) => {
                                if (!step4Locked) {
                                    e.target.style.backgroundColor = styles.accentHover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!step4Locked) {
                                    e.target.style.backgroundColor = styles.accentPrimary;
                                }
                            }}
                        >
                            {isLoadingStep4 ? 'Creating...' : 'Create Swap'}
                        </button>

                        {/* Result Box */}
                        {step4Result.visible && (
                            <div style={{
                                marginTop: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${step4Result.variant === 'success' ? styles.successBorder : step4Result.variant === 'error' ? styles.errorBorder : styles.borderPrimary}`,
                                backgroundColor: step4Result.variant === 'success' ? styles.successBg : step4Result.variant === 'error' ? styles.errorBg : styles.bgPrimary,
                                padding: '12px 16px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: step4Result.variant === 'success' ? styles.successText : step4Result.variant === 'error' ? styles.errorText : styles.textPrimary,
                                wordWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}>
                                {step4Result.message}
                            </div>
                        )}

                        {/* Deposit Info */}
                        {showDepositInfo && depositAddress && (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: styles.textPrimary
                                }}>
                                    Send{' '}
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        borderRadius: '8px',
                                        border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                        backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.accentPrimary
                                    }}>
                                        {sourceToken}
                                    </span>
                                    {' '}to this address on{' '}
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        borderRadius: '8px',
                                        border: `1px solid ${theme === 'dark' ? 'rgba(204, 45, 93, 0.4)' : 'rgba(204, 45, 93, 0.2)'}`,
                                        backgroundColor: theme === 'dark' ? 'rgba(204, 45, 93, 0.2)' : 'rgba(204, 45, 93, 0.1)',
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.accentPrimary
                                    }}>
                                        {sourceNetwork.replace(/_MAINNET/g, '').replace(/_SEPOLIA/g, ' Sepolia').replace(/_/g, ' ')}
                                    </span>
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    borderRadius: '12px',
                                    border: `1px solid ${styles.borderPrimary}`,
                                    backgroundColor: styles.bgHighlight,
                                    padding: '12px 16px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    color: styles.textPrimary
                                }}>
                                    <span style={{ wordBreak: 'break-all', flex: 1, minWidth: '200px' }}>
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
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            borderRadius: '6px',
                                            border: `1px solid ${styles.borderPrimary}`,
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            color: styles.textSecondary,
                                            backgroundColor: styles.bgPrimary,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = styles.accentPrimary;
                                            e.target.style.color = styles.accentPrimary;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = styles.borderPrimary;
                                            e.target.style.color = styles.textSecondary;
                                        }}
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    borderRadius: '8px',
                                    border: `1px solid ${styles.borderPrimary}`,
                                    backgroundColor: styles.bgHighlight,
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    color: styles.textSecondary
                                }}>
                                    <span style={{ fontSize: '14px', color: styles.accentPrimary, flexShrink: 0 }}>ℹ️</span>
                                    <span>
                                        This address is retrieved from the API response at:{' '}
                                        <code style={{
                                            borderRadius: '4px',
                                            backgroundColor: styles.bgTertiary,
                                            padding: '2px 4px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            color: styles.accentPrimary
                                        }}>
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
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px',
                        borderBottom: `1px solid ${styles.borderPrimary}`,
                        paddingBottom: '40px',
                        marginBottom: '48px',
                        scrollMarginTop: '96px',
                        opacity: step5Locked ? 0.35 : 1,
                        pointerEvents: step5Locked ? 'none' : 'auto',
                        filter: step5Locked ? 'grayscale(50%)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '9999px',
                            border: `1px solid ${styles.borderPrimary}`,
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.35em',
                            color: styles.accentPrimary,
                            width: 'fit-content'
                        }}>
                            {tokenMode === 'multiple' ? 'Step 6:' : 'Step 5:'}
                        </span>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: styles.textPrimary
                        }}>
                            Check Status
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: styles.textSecondary
                        }}>
                            Monitor your transaction status in real-time.
                        </p>

                        {/* Check Status Button */}
                        <button
                            onClick={handleTrackSwap}
                            disabled={step5Locked}
                            aria-label="Check swap transaction status"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                backgroundColor: step5Locked ? styles.borderPrimary : (trackingInterval ? styles.errorBorder : styles.accentPrimary),
                                color: step5Locked ? styles.textTertiary : styles.bgPrimary,
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: step5Locked ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                marginTop: '12px'
                            }}
                            onMouseEnter={(e) => {
                                if (!step5Locked && !trackingInterval) {
                                    e.target.style.backgroundColor = styles.accentHover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!step5Locked && !trackingInterval) {
                                    e.target.style.backgroundColor = styles.accentPrimary;
                                }
                            }}
                        >
                            {trackingInterval ? 'Stop Tracking' : 'Check Status'}
                        </button>

                        {/* Swap Route Display */}
                        {showSwapRoute && swapStatus && (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                borderRadius: '12px',
                                border: `1px solid ${styles.borderPrimary}`,
                                backgroundColor: styles.bgHighlight,
                                padding: '12px 16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: styles.textSecondary
                            }}>
                                <span style={{ color: styles.textPrimary }}>
                                    {sourceNetwork.replace(/_/g, ' ')} ({sourceToken})
                                </span>
                                <span>→</span>
                                <span style={{ color: styles.textPrimary }}>
                                    {selectedNetworkDisplay} ({tokenMode === 'single' ? destinationToken : destinationTokenMultiple})
                                </span>
                            </div>
                        )}

                        {/* Status Guide */}
                        {showStatusGuide && (
                            <div style={{
                                marginTop: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                borderRadius: '12px',
                                border: `1px solid ${styles.borderPrimary}`,
                                backgroundColor: styles.bgHighlight,
                                padding: '16px',
                                fontSize: '12px',
                                lineHeight: '1.6',
                                color: styles.textSecondary
                            }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{
                                        minWidth: '150px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.textPrimary
                                    }}>
                                        user_transfer_pending
                                    </span>
                                    <span>Awaiting your deposit to the provided address.</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{
                                        minWidth: '150px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.textPrimary
                                    }}>
                                        ls_transfer_pending
                                    </span>
                                    <span>Deposit received—Layerswap is processing your transfer.</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{
                                        minWidth: '150px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.textPrimary
                                    }}>
                                        completed
                                    </span>
                                    <span>Transfer successfully sent to the destination account.</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{
                                        minWidth: '150px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: styles.textPrimary
                                    }}>
                                        failed
                                    </span>
                                    <span>The transfer could not be completed. Contact support.</span>
                                </div>
                            </div>
                        )}

                        {/* Result Box */}
                        {step5Result.visible && (
                            <div style={{
                                marginTop: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${step5Result.variant === 'success' ? styles.successBorder : step5Result.variant === 'error' ? styles.errorBorder : styles.borderPrimary}`,
                                backgroundColor: step5Result.variant === 'success' ? styles.successBg : step5Result.variant === 'error' ? styles.errorBg : styles.bgPrimary,
                                padding: '12px 16px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: step5Result.variant === 'success' ? styles.successText : step5Result.variant === 'error' ? styles.errorText : styles.textPrimary,
                                wordWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}>
                                {step5Result.message}
                            </div>
                        )}

                        {/* Swap Transactions */}
                        {showSwapTransactions && swapStatus && (
                            <div style={{ marginTop: '16px' }}>
                                <h4 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: styles.textPrimary,
                                    marginBottom: '12px'
                                }}>
                                    Transactions
                                </h4>
                                {swapTransactions.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {swapTransactions.map((tx, index) => (
                                            <div key={index} style={{
                                                padding: '12px',
                                                backgroundColor: styles.bgPrimary,
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            backgroundColor: styles.bgTertiary,
                                                            color: styles.textSecondary
                                                        }}>
                                                            {tx.type || 'transfer'}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: styles.textPrimary
                                                        }}>
                                                            {tx.amount || 'N/A'} {tx.token || ''}
                                                        </span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        color: styles.textSecondary,
                                                        marginTop: '1px'
                                                    }}>
                                                        {tx.network || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: styles.bgPrimary,
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: styles.textSecondary,
                                        fontStyle: 'italic'
                                    }}>
                                        No transactions available yet. Waiting for deposit...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Section */}
                <div style={{
                    marginTop: '48px',
                    borderRadius: '18px',
                    border: `1px solid ${styles.borderPrimary}`,
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                    padding: '24px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: styles.textPrimary,
                        marginBottom: '8px'
                    }}>
                        Need Help with Integration?
                    </h3>
                    <p style={{
                        marginTop: '8px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: styles.textSecondary
                    }}>
                        For partnership inquiries and integration support, our team is here to help.
                    </p>
                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px'
                    }}>
                        <a
                            href="mailto:partners@layerswap.io"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '8px',
                                backgroundColor: styles.accentPrimary,
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: styles.bgPrimary,
                                textDecoration: 'none',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = styles.accentHover}
                            onMouseLeave={(e) => e.target.style.backgroundColor = styles.accentPrimary}
                        >
                            ✉️ partners@layerswap.io
                        </a>
                        <a
                            href="https://t.me/layerswap_dev"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'white',
                                textDecoration: 'none',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'filter 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.filter = 'brightness(1.05)'}
                            onMouseLeave={(e) => e.target.style.filter = 'none'}
                        >
                            💬 Join Dev Community
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <footer style={{
                    marginTop: '48px',
                    borderTop: `1px solid ${styles.borderPrimary}`,
                    paddingTop: '24px'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: styles.textSecondary
                        }}>
                            <a
                                href="https://www.layerswap.io"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = styles.accentPrimary}
                                onMouseLeave={(e) => e.target.style.color = styles.textSecondary}
                            >
                                🏠 Layerswap
                            </a>
                            <a
                                href="https://docs.layerswap.io"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = styles.accentPrimary}
                                onMouseLeave={(e) => e.target.style.color = styles.textSecondary}
                            >
                                📚 Documentation
                            </a>
                            <a
                                href="https://x.com/layerswap"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = styles.accentPrimary}
                                onMouseLeave={(e) => e.target.style.color = styles.textSecondary}
                            >
                                🐦 X
                            </a>
                            <a
                                href="https://discord.com/invite/layerswap"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.color = styles.accentPrimary}
                                onMouseLeave={(e) => e.target.style.color = styles.textSecondary}
                            >
                                💬 Discord
                            </a>
                            <a
                                href="https://github.com/layerswap"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = styles.accentPrimary}
                                onMouseLeave={(e) => e.target.style.color = styles.textSecondary}
                            >
                                💻 GitHub
                            </a>
                        </div>
                        <p style={{
                            fontSize: '12px',
                            color: styles.textSecondary,
                            opacity: 0.8
                        }}>
                            © {new Date().getFullYear()} Layerswap Labs, Inc.
                        </p>
                    </div>
                </footer>
                </div>

                {/* API Sidebar */}
                {windowWidth >= 1024 && (
                <aside style={{
                    width: '416px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    borderLeft: `1px solid ${styles.borderPrimary}`,
                    paddingLeft: '24px',
                    position: 'fixed',
                    top: '140px',
                    left: '1200px',
                    maxHeight: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                    alignSelf: 'flex-start',
                    backgroundColor: styles.bgSecondary,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!hasApiActivity() ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '18px',
                                border: `1px solid ${styles.borderPrimary}`,
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                padding: '32px 20px',
                                textAlign: 'center',
                                fontSize: '14px',
                                color: styles.textSecondary,
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}>
                                <span style={{ fontSize: '18px', color: styles.accentPrimary, marginBottom: '12px' }}>🔗</span>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: styles.textSecondary }}>
                                    Run an API step to see live requests and responses here.
                                </p>
                            </div>
                        ) : (
                            (() => {
                                const activeStepKey = getActiveApiStepKey;
                                if (!activeStepKey) return null;
                                const activity = apiActivity[activeStepKey];
                                
                                return (
                                    <div key={activeStepKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {/* Request Card */}
                                        {activity.request && (
                                            <div style={{
                                                borderRadius: '18px',
                                                border: `1px solid ${styles.borderPrimary}`,
                                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                                overflow: 'hidden',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    borderBottom: `1px solid ${styles.borderPrimary}`,
                                                    backgroundColor: styles.bgHighlight,
                                                    padding: '16px 20px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: styles.textPrimary
                                                }}>
                                                    <span>API Request</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                borderRadius: '6px',
                                                                border: `1px solid ${styles.borderPrimary}`,
                                                                padding: '6px 12px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                color: styles.textSecondary,
                                                                backgroundColor: styles.bgPrimary,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.borderColor = styles.accentPrimary;
                                                                e.target.style.color = styles.accentPrimary;
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.borderColor = styles.borderPrimary;
                                                                e.target.style.color = styles.textSecondary;
                                                            }}
                                                        >
                                                            📋 Copy
                                                        </button>
                                                        {getApiDocsUrl(activeStepKey) && (
                                                            <a
                                                                href={getApiDocsUrl(activeStepKey)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500',
                                                                    color: styles.textSecondary,
                                                                    textDecoration: 'none',
                                                                    transition: 'color 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.color = styles.accentPrimary}
                                                                onMouseLeave={(e) => e.target.style.color = styles.textSecondary}
                                                            >
                                                                🔗 API Docs
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '16px 20px',
                                                    fontSize: '12px',
                                                    fontFamily: 'monospace',
                                                    color: styles.textPrimary,
                                                    lineHeight: '1.6',
                                                    overflowX: 'auto',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word'
                                                }}>
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
                                            <div style={{
                                                borderRadius: '18px',
                                                border: `1px solid ${styles.borderPrimary}`,
                                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                                maxHeight: '420px',
                                                minHeight: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                overflow: 'hidden',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    borderBottom: `1px solid ${styles.borderPrimary}`,
                                                    backgroundColor: styles.bgHighlight,
                                                    padding: '16px 20px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: styles.textPrimary
                                                }}>
                                                    <span>API Response</span>
                                                    <button
                                                        onClick={async () => {
                                                            await copyToClipboard(JSON.stringify(activity.response, null, 2));
                                                        }}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            borderRadius: '6px',
                                                            border: `1px solid ${styles.borderPrimary}`,
                                                            padding: '6px 12px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            color: styles.textSecondary,
                                                            backgroundColor: styles.bgPrimary,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.borderColor = styles.accentPrimary;
                                                            e.target.style.color = styles.accentPrimary;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.borderColor = styles.borderPrimary;
                                                            e.target.style.color = styles.textSecondary;
                                                        }}
                                                    >
                                                        📋 Copy
                                                    </button>
                                                </div>
                                                <div style={{
                                                    flex: 1,
                                                    overflowY: 'auto',
                                                    backgroundColor: styles.bgPrimary,
                                                    padding: '16px 20px',
                                                    fontSize: '12px',
                                                    lineHeight: '1.6',
                                                    color: styles.textPrimary
                                                }}>
                                                    <pre style={{
                                                        margin: 0,
                                                        fontFamily: 'monospace',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        color: 'inherit'
                                                    }} dangerouslySetInnerHTML={{ __html: formatJson(activity.response) }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </aside>
                )}
            </div>
        </div>
    );
};

