// SPDX-LICENSE-Identifier: AGPL-3.0-or-later

/**
 * Minimal AI Integration - Clean & Professional
 * No mock data, only real AI when configured
 */

interface AIConfig {
  provider: 'ollama' | 'anthropic' | 'openai' | 'none';
  enabled: boolean;
}

class MinimalAIIntegration {
  private config: AIConfig = {
    provider: 'none',
    enabled: false
  };

  private settingsPanel: HTMLElement | null = null;
  private toggleBtn: HTMLElement | null = null;

  constructor() {
    // Only initialize if user explicitly enables AI
    this.checkAIAvailability();
  }

  /**
   * Check if AI backend is configured (no fake data!)
   */
  private async checkAIAvailability() {
    try {
      // Check if backend has AI configured
      const response = await fetch('/ai/status');
      if (response.ok) {
        const data = await response.json();
        if (data.enabled) {
          this.config.enabled = true;
          this.config.provider = data.provider;
          this.init();
        }
      }
    } catch (e) {
      // AI not available - that's fine, just don't show anything
      console.debug('AI features not configured');
    }
  }

  /**
   * Initialize minimal UI (only if AI is available)
   */
  private init() {
    this.createToggleButton();
    this.createSettingsPanel();
    this.loadUserPreferences();
  }

  /**
   * Create minimal toggle button
   */
  private createToggleButton() {
    const btn = document.createElement('div');
    btn.id = 'ai-toggle-btn';
    btn.title = 'AI Settings';

    btn.addEventListener('click', () => {
      this.toggleSettings();
    });

    document.body.appendChild(btn);
    this.toggleBtn = btn;
  }

  /**
   * Create minimal settings panel
   */
  private createSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = 'ai-settings';
    panel.innerHTML = `
      <div class="ai-header">
        <h4>AI Assistant</h4>
        <button class="close-btn">×</button>
      </div>

      <div class="ai-provider-select">
        <label>Provider</label>
        <select id="ai-provider">
          <option value="none">Disabled</option>
          <option value="ollama">Ollama (Local)</option>
          <option value="anthropic">Anthropic Claude</option>
          <option value="openai">OpenAI GPT</option>
        </select>
      </div>

      <div class="ai-status">
        <span class="status-dot"></span>
        <span>Ready</span>
      </div>
    `;

    // Close button
    const closeBtn = panel.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => {
      panel.classList.remove('active');
    });

    // Provider selection
    const select = panel.querySelector('#ai-provider') as HTMLSelectElement;
    if (select) {
      select.value = this.config.provider;
      select.addEventListener('change', (e) => {
        this.updateProvider((e.target as HTMLSelectElement).value as any);
      });
    }

    document.body.appendChild(panel);
    this.settingsPanel = panel;
  }

  /**
   * Toggle settings panel
   */
  private toggleSettings() {
    this.settingsPanel?.classList.toggle('active');
  }

  /**
   * Update AI provider
   */
  private async updateProvider(provider: string) {
    this.config.provider = provider as any;

    // Save to backend
    try {
      await fetch('/ai/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
    } catch (e) {
      console.error('Failed to update AI provider', e);
    }

    // Save to localStorage
    localStorage.setItem('ai_provider', provider);
  }

  /**
   * Load user preferences
   */
  private loadUserPreferences() {
    const saved = localStorage.getItem('ai_provider');
    if (saved) {
      this.config.provider = saved as any;
      const select = document.querySelector('#ai-provider') as HTMLSelectElement;
      if (select) {
        select.value = saved;
      }
    }
  }

  /**
   * Add subtle indicator to result (only with real data)
   */
  static addIndicatorToResult(result: HTMLElement, score: string, summary?: string) {
    if (!score) return; // No fake data!

    // Minimal indicator badge
    const indicator = document.createElement('span');
    indicator.className = 'result-ai-indicator';
    indicator.setAttribute('data-score', score);
    indicator.innerHTML = `
      <span class="ai-icon">✓</span>
      <span>${score === 'high' ? 'Relevant' : score === 'medium' ? 'Related' : 'Info'}</span>
    `;

    // Add to title area
    const title = result.querySelector('h3');
    if (title) {
      title.appendChild(indicator);
    }

    // Add inline summary if provided (no cards!)
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
}

// Only initialize if on results page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('results')) {
      new MinimalAIIntegration();
    }
  });
} else {
  if (document.getElementById('results')) {
    new MinimalAIIntegration();
  }
}

export { MinimalAIIntegration };
