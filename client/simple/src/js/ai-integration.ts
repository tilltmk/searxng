/**
 * Premium AI Integration - Apple-Style with Spinning Gradient Border
 * Handles provider selection, API key management, and AI features
 */

interface AIConfig {
  provider: 'ollama' | 'anthropic' | 'openai' | 'none';
  apiKey: string;
  enableScoring: boolean;
  enableSummaries: boolean;
}

class PremiumAIIntegration {
  private config: AIConfig;
  private localStorageKey = 'searxng_ai_config';

  constructor() {
    // Load saved config from localStorage
    this.config = this.loadConfig();
    this.init();
  }

  /**
   * Initialize AI Integration
   */
  private init() {
    console.log('🤖 Premium AI Integration initialized');

    // Setup provider buttons
    this.setupProviderButtons();

    // Setup API key input
    this.setupApiKeyInput();

    // Setup feature toggles
    this.setupFeatureToggles();

    // Apply saved config to UI
    this.applyConfigToUI();

    // Update status
    this.updateStatus();
  }

  /**
   * Load config from localStorage
   */
  private loadConfig(): AIConfig {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load AI config:', e);
    }

    // Default config
    return {
      provider: 'none',
      apiKey: '',
      enableScoring: true,
      enableSummaries: true
    };
  }

  /**
   * Save config to localStorage
   */
  private saveConfig() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.config));
      console.log('💾 AI config saved', this.config);
    } catch (e) {
      console.error('Failed to save AI config:', e);
    }
  }

  /**
   * Setup provider selection buttons
   */
  private setupProviderButtons() {
    const providerBtns = document.querySelectorAll<HTMLElement>('.provider-btn');

    providerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const provider = btn.getAttribute('data-provider') as AIConfig['provider'];

        // Remove active class from all buttons
        providerBtns.forEach(b => b.classList.remove('active'));

        // Add active class to clicked button
        btn.classList.add('active');

        // Update config
        this.config.provider = provider;
        this.saveConfig();
        this.updateStatus();

        // Animate button
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 100);

        console.log(`✨ AI Provider changed to: ${provider}`);
      });
    });
  }

  /**
   * Setup API key input
   */
  private setupApiKeyInput() {
    const input = document.getElementById('ai-api-key-input') as HTMLInputElement;
    if (!input) return;

    // Debounced save
    let saveTimeout: number;
    input.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => {
        this.config.apiKey = input.value;
        this.saveConfig();
        this.updateStatus();
        console.log('🔑 API key updated');
      }, 500);
    });

    // Load saved key
    if (this.config.apiKey) {
      input.value = this.config.apiKey;
    }
  }

  /**
   * Setup feature toggle switches
   */
  private setupFeatureToggles() {
    // Scoring toggle
    this.setupToggle('ai-scoring', (checked) => {
      this.config.enableScoring = checked;
      this.saveConfig();
      console.log(`⭐ Result scoring: ${checked ? 'enabled' : 'disabled'}`);
    });

    // Summaries toggle
    this.setupToggle('ai-summaries', (checked) => {
      this.config.enableSummaries = checked;
      this.saveConfig();
      console.log(`📝 Smart summaries: ${checked ? 'enabled' : 'disabled'}`);
    });
  }

  /**
   * Setup individual toggle
   */
  private setupToggle(id: string, onChange: (checked: boolean) => void) {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (!checkbox) return;

    const toggle = checkbox.parentElement?.querySelector('.feature-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      // Prevent double-triggering
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      checkbox.checked = !checkbox.checked;
      onChange(checkbox.checked);

      // Animate toggle
      const toggleSwitch = toggle.querySelector('.toggle-switch');
      if (toggleSwitch) {
        (toggleSwitch as HTMLElement).style.transform = 'scale(0.95)';
        setTimeout(() => {
          (toggleSwitch as HTMLElement).style.transform = '';
        }, 100);
      }
    });

    checkbox.addEventListener('change', () => {
      onChange(checkbox.checked);
    });
  }

  /**
   * Apply saved config to UI
   */
  private applyConfigToUI() {
    // Set active provider button
    if (this.config.provider !== 'none') {
      const btn = document.querySelector(`[data-provider="${this.config.provider}"]`);
      if (btn) {
        btn.classList.add('active');
      }
    }

    // Set API key
    const input = document.getElementById('ai-api-key-input') as HTMLInputElement;
    if (input && this.config.apiKey) {
      input.value = this.config.apiKey;
    }

    // Set toggles
    const scoringCheckbox = document.getElementById('ai-scoring') as HTMLInputElement;
    if (scoringCheckbox) {
      scoringCheckbox.checked = this.config.enableScoring;
    }

    const summariesCheckbox = document.getElementById('ai-summaries') as HTMLInputElement;
    if (summariesCheckbox) {
      summariesCheckbox.checked = this.config.enableSummaries;
    }
  }

  /**
   * Update AI status indicator
   */
  private updateStatus() {
    const statusText = document.querySelector('.ai-status .status-text');
    const statusDot = document.querySelector('.ai-status .status-dot') as HTMLElement;
    const status = document.querySelector('.ai-status') as HTMLElement;

    if (!statusText || !statusDot || !status) return;

    const isConfigured = this.config.provider !== 'none' && this.config.apiKey.length > 0;

    if (isConfigured) {
      statusText.textContent = `${this.getProviderName()} Connected`;
      statusDot.style.background = '#30d158';
      statusDot.style.boxShadow = '0 0 12px rgba(48, 209, 88, 0.6)';
      status.style.background = 'linear-gradient(135deg, rgba(48, 209, 88, 0.1), rgba(48, 209, 88, 0.05))';
      status.style.borderColor = 'rgba(48, 209, 88, 0.3)';
      status.style.color = '#30d158';
    } else {
      statusText.textContent = 'Not Configured';
      statusDot.style.background = '#ff9f0a';
      statusDot.style.boxShadow = '0 0 12px rgba(255, 159, 10, 0.6)';
      status.style.background = 'linear-gradient(135deg, rgba(255, 159, 10, 0.1), rgba(255, 159, 10, 0.05))';
      status.style.borderColor = 'rgba(255, 159, 10, 0.3)';
      status.style.color = '#ff9f0a';
    }
  }

  /**
   * Get provider display name
   */
  private getProviderName(): string {
    switch (this.config.provider) {
      case 'ollama':
        return 'Ollama';
      case 'anthropic':
        return 'Anthropic';
      case 'openai':
        return 'OpenAI';
      default:
        return 'AI';
    }
  }

  /**
   * Add AI indicator to result
   */
  static addIndicatorToResult(result: HTMLElement, score: string, summary?: string) {
    const indicator = document.createElement('span');
    indicator.className = 'result-ai-indicator';
    indicator.setAttribute('data-score', score);

    const icon = document.createElement('span');
    icon.className = 'ai-icon';
    icon.textContent = score === 'high' ? '⭐' : score === 'medium' ? '✨' : '💡';

    const text = document.createElement('span');
    text.textContent = score === 'high' ? 'Highly Relevant' : score === 'medium' ? 'Related' : 'Info';

    indicator.appendChild(icon);
    indicator.appendChild(text);

    const title = result.querySelector('h3');
    if (title) {
      title.appendChild(indicator);
    }

    // Add summary if provided
    if (summary) {
      const summaryEl = document.createElement('div');
      summaryEl.className = 'ai-summary-inline';
      summaryEl.textContent = summary;

      const content = result.querySelector('.content');
      if (content) {
        content.parentNode?.insertBefore(summaryEl, content.nextSibling);
      }
    }
  }

  /**
   * Get current config (for external use)
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Check if AI is configured and enabled
   */
  isEnabled(): boolean {
    return this.config.provider !== 'none' && this.config.apiKey.length > 0;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PremiumAIIntegration();
  });
} else {
  new PremiumAIIntegration();
}

// Export for use in other modules
export { PremiumAIIntegration };
