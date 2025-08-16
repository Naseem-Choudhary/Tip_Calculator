document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // STATE MANAGEMENT
    // =================================================================
    const appState = {
        bill: 6000,
        tipPercent: 0.10,
        taxPercent: 0,
        people: 1,
        currency: '₹',
        isRounded: false,
        customTipActive: false,
        customTaxActive: false,
        isSplitting: false,
    };

    // =================================================================
    // DOM ELEMENT SELECTORS
    // =================================================================
    const elements = {
        // Theme
        themeToggleButton: document.getElementById('theme-toggle-button'),
        
        // Inputs
        billAmountInput: document.getElementById('bill-amount'),
        currencyDropdown: document.getElementById('currency-dropdown'),
        currencySymbolInput: document.getElementById('currency-symbol-input'),
        
        // Tip
        tipChipsContainer: document.getElementById('tip-chips'),
        customTipContainer: document.getElementById('custom-tip-container'),
        customTipSlider: document.getElementById('custom-tip-slider'),
        customTipLabel: document.getElementById('custom-tip-label'),
        customTipInput: document.getElementById('custom-tip-input'),
        
        // Tax
        taxChipsContainer: document.getElementById('tax-chips'),
        customTaxContainer: document.getElementById('custom-tax-container'),
        customTaxSlider: document.getElementById('custom-tax-slider'),
        customTaxLabel: document.getElementById('custom-tax-label'),
        customTaxInput: document.getElementById('custom-tax-input'),

        // People & Splitting
        splitBillSwitch: document.getElementById('split-bill-switch'),
        splitSection: document.getElementById('split-section'),
        decrementPeopleBtn: document.getElementById('decrement-people'),
        incrementPeopleBtn: document.getElementById('increment-people'),
        peopleCountDisplay: document.getElementById('people-count'),

        // Results
        roundingSwitch: document.getElementById('rounding-switch'),
        resultBillAmount: document.getElementById('result-bill-amount'),
        resultTipAmount: document.getElementById('result-tip-amount'),
        resultTaxAmount: document.getElementById('result-tax-amount'),
        resultTotalAmount: document.getElementById('result-total-amount'),
        perPersonDisplay: document.getElementById('per-person-display'),
        resultPerPerson: document.getElementById('result-per-person'),

        // Share
        shareButton: document.getElementById('share-button'),
        shareFeedback: document.getElementById('share-feedback'),
    };

    // =================================================================
    // THEME MANAGEMENT
    // =================================================================
    const applyTheme = (theme) => {
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);

        const iconContainer = elements.themeToggleButton;
        if (theme === 'dark') {
            iconContainer.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'; // Moon
        } else {
            iconContainer.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'; // Sun
        }
    };

    const handleThemeToggle = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    // =================================================================
    // CALCULATION & DOM UPDATE LOGIC
    // =================================================================
    const calculateResults = () => {
        const { bill, tipPercent, taxPercent, people, isRounded } = appState;
        const tipAmount = bill * tipPercent;
        const taxAmount = bill * taxPercent;
        const totalAmount = bill + tipAmount + taxAmount;
        let perPersonAmount = totalAmount / people;
        if (isRounded) {
            perPersonAmount = Math.ceil(perPersonAmount);
        }
        return { billAmount: bill, tipAmount, taxAmount, totalAmount, perPersonAmount };
    };

    const updateDOM = () => {
        const results = calculateResults();
        const { currency, isSplitting } = appState;

        // Update results text
        elements.resultBillAmount.textContent = `${currency}${results.billAmount.toFixed(2)}`;
        elements.resultTipAmount.textContent = `${currency}${results.tipAmount.toFixed(2)}`;
        elements.resultTaxAmount.textContent = `${currency}${results.taxAmount.toFixed(2)}`;
        elements.resultTotalAmount.textContent = `${currency}${results.totalAmount.toFixed(2)}`;
        elements.resultPerPerson.textContent = `${currency}${results.perPersonAmount.toFixed(2)}`;
        
        animateValueUpdate(elements.resultTotalAmount);
        animateValueUpdate(elements.resultPerPerson);

        // Update inputs and controls
        elements.currencySymbolInput.textContent = currency;
        elements.peopleCountDisplay.textContent = `${appState.people} ${appState.people > 1 ? 'People' : 'Person'}`;
        
        updateActiveChip(elements.tipChipsContainer, appState.customTipActive ? 'custom' : appState.tipPercent);
        updateActiveChip(elements.taxChipsContainer, appState.customTaxActive ? 'custom' : appState.taxPercent);

        elements.customTipContainer.style.display = appState.customTipActive ? 'block' : 'none';
        elements.customTaxContainer.style.display = appState.customTaxActive ? 'block' : 'none';

        // Toggle visibility of splitting sections
        elements.splitSection.classList.toggle('visible', isSplitting);
        elements.perPersonDisplay.classList.toggle('hidden', !isSplitting);
    };
    
    const animateValueUpdate = (element) => {
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 300);
    };

    const updateActiveChip = (container, value) => {
        container.querySelectorAll('.chip').forEach(chip => {
            const chipValue = chip.dataset.value === 'custom' ? 'custom' : parseFloat(chip.dataset.value);
            chip.classList.toggle('active', chipValue === value);
        });
    };

    // =================================================================
    // EVENT HANDLERS
    // =================================================================
    const handleBillInput = (e) => {
        appState.bill = parseFloat(e.target.value) || 0;
        calculateAndRender();
    };

    const handleCurrencyChange = (e) => {
        appState.currency = e.target.value;
        calculateAndRender();
    };
    
    const handleTipSelection = (e) => {
        if (!e.target.classList.contains('chip')) return;
        const value = e.target.dataset.value;
        appState.customTipActive = (value === 'custom');
        if (appState.customTipActive) {
            appState.tipPercent = parseFloat(elements.customTipInput.value) / 100 || 0;
        } else {
            appState.tipPercent = parseFloat(value);
        }
        calculateAndRender();
    };

    const handleTaxSelection = (e) => {
        if (!e.target.classList.contains('chip')) return;
        const value = e.target.dataset.value;
        appState.customTaxActive = (value === 'custom');
        if (appState.customTaxActive) {
            appState.taxPercent = parseFloat(elements.customTaxInput.value) / 100 || 0;
        } else {
            appState.taxPercent = parseFloat(value);
        }
        calculateAndRender();
    };
    
    const handleCustomTipChange = () => {
        const value = parseFloat(elements.customTipSlider.value);
        elements.customTipInput.value = value;
        elements.customTipLabel.textContent = `${value}%`;
        appState.tipPercent = value / 100;
        calculateAndRender();
    };
    
    const handleCustomTaxChange = () => {
        const value = parseFloat(elements.customTaxSlider.value);
        elements.customTaxInput.value = value;
        elements.customTaxLabel.textContent = `${value}%`;
        appState.taxPercent = value / 100;
        calculateAndRender();
    };

    const handleSplitToggle = (e) => {
        appState.isSplitting = e.target.checked;
        if (!appState.isSplitting) {
            appState.people = 1; // Reset people count if not splitting
        }
        calculateAndRender();
    };

    const handlePeopleChange = (direction) => {
        if (direction === 'increment') {
            appState.people++;
        } else if (direction === 'decrement' && appState.people > 1) {
            appState.people--;
        }
        calculateAndRender();
    };

    const handleRoundingToggle = (e) => {
        appState.isRounded = e.target.checked;
        calculateAndRender();
    };
    
    const handleShare = async () => {
        const results = calculateResults();
        const shareText = appState.isSplitting && appState.people > 1
            ? `Bill Split: Each person pays ${appState.currency}${results.perPersonAmount.toFixed(2)} (Total: ${appState.currency}${results.totalAmount.toFixed(2)}).`
            : `Bill Total: ${appState.currency}${results.totalAmount.toFixed(2)}.`;
        
        if (navigator.share) {
            await navigator.share({ title: 'Bill Split Result', text: shareText });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                elements.shareFeedback.classList.add('show');
                setTimeout(() => elements.shareFeedback.classList.remove('show'), 2000);
            });
        }
    };
    
    const calculateAndRender = () => {
        updateDOM();
    };

    // =================================================================
    // INITIALIZATION
    // =================================================================
    const init = () => {
        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);

        // Set default form values
        elements.billAmountInput.value = appState.bill;
        elements.roundingSwitch.checked = appState.isRounded;
        elements.splitBillSwitch.checked = appState.isSplitting;
        elements.customTipSlider.value = 25;
        elements.customTipInput.value = 25;
        elements.customTipLabel.textContent = '25%';
        elements.customTaxSlider.value = 10;
        elements.customTaxInput.value = 10;
        elements.customTaxLabel.textContent = '10%';
        
        // Setup event listeners
        elements.themeToggleButton.addEventListener('click', handleThemeToggle);
        elements.billAmountInput.addEventListener('input', handleBillInput);
        elements.currencyDropdown.addEventListener('change', handleCurrencyChange);
        elements.tipChipsContainer.addEventListener('click', handleTipSelection);
        elements.taxChipsContainer.addEventListener('click', handleTaxSelection);
        elements.customTipSlider.addEventListener('input', handleCustomTipChange);
        elements.customTipInput.addEventListener('input', (e) => { elements.customTipSlider.value = e.target.value; handleCustomTipChange(); });
        elements.customTaxSlider.addEventListener('input', handleCustomTaxChange);
        elements.customTaxInput.addEventListener('input', (e) => { elements.customTaxSlider.value = e.target.value; handleCustomTaxChange(); });
        elements.splitBillSwitch.addEventListener('change', handleSplitToggle);
        elements.incrementPeopleBtn.addEventListener('click', () => handlePeopleChange('increment'));
        elements.decrementPeopleBtn.addEventListener('click', () => handlePeopleChange('decrement'));
        elements.roundingSwitch.addEventListener('change', handleRoundingToggle);
        elements.shareButton.addEventListener('click', handleShare);

        // Initial setup
        calculateAndRender();
    };

    init();
});
