export interface SlackBotSelectionPageOptions {
  callbackUrl: string;
}

export function generateBotSelectionPage(
  { callbackUrl }: SlackBotSelectionPageOptions,
): string {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Connector - Slack Integration Setup</title>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
        margin: 0;
        padding: 20px;
        background: #2925244d;
        color: #f5f5f4;
        line-height: 1.5;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      body.light-mode {
        background: #fff;
        color: #1a1a1a;
      }

      .container {
        width: 425px;
        min-height: 400px;
        background: #292524;
        border-radius: 16px;
        overflow: hidden;
        border: none;
        box-shadow: none;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .container.light-mode {
        background: #fff;
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e5e5;
      }

      .modal-overlay {
        position: static;
        width: auto;
        height: auto;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: auto;
      }

      .selection-header {
        padding: 24px 24px 16px;
        background: #292524;
      }

      .selection-header.light-mode {
        background: #fff;
      }

      .header-logo-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .slack-logo {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #f5f5f4;
        flex: 1;
        text-align: left;
        margin: 0 16px;
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
      }

      .header-title.light-mode {
        color: #1a1a1a;
        font-weight: 600;
      }

      #theme-toggle {
        color: #f5f5f4;
        background: transparent;
        border: none;
        cursor: pointer;
      }

      #theme-toggle:hover {
        opacity: 0.8;
      }

      .light-mode #theme-toggle {
        color: #1a1a1a;
      }

      #theme-icon-path {
        transition: fill 0.2s ease;
        fill: #f5f5f4;
      }

      .light-mode #theme-icon-path {
        fill: #1a1a1a;
      }

      .selection-subtitle {
        color: #a8a29e;
        font-size: 14px;
        text-align: left;
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
      }

      .selection-subtitle.light-mode {
        color: #666;
      }

      .selection-content {
        padding: 24px;
        background: rgba(0, 0, 0, 0);
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .selection-content.light-mode {
        background: #fff;
      }

      .bot-option {
        border: 1px solid #57534e;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        cursor: pointer;
        transition: all 0.2s;
        background: #292524;
      }

      .bot-option.light-mode {
        background: #fff;
        border-color: #e5e5e5;
      }

      .bot-option:hover {
        border-color: #a8a29e;
        background: #404040;
      }

      .bot-option.light-mode:hover {
        background: #f5f5f4;
        border-color: #999;
      }

      .bot-option.selected {
        border-color: #f5f5f4;
        background: rgba(245, 245, 244, 0.1);
      }

      .bot-option.light-mode.selected {
        border-color: #292524;
        background: rgba(26, 26, 26, 0.05);
      }

      .bot-option-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .bot-radio {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #57534e;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .bot-option.light-mode .bot-radio {
        border-color: #e5e5e5;
      }

      .bot-option.selected .bot-radio {
        border-color: #f5f5f4;
        background: #f5f5f4;
      }

      .bot-option.light-mode.selected .bot-radio {
        border-color: #292524;
        background: #292524;
      }

      .bot-radio-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #292524;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .bot-option.selected .bot-radio-dot {
        opacity: 1;
      }

      .bot-option.light-mode.selected .bot-radio-dot {
        background: #fff;
      }

      .bot-title {
        font-weight: 600;
        font-size: 16px;
        color: #f5f5f4;
      }

      .bot-title.light-mode {
        color: #1a1a1a;
      }

      .bot-description {
        color: #a8a29e;
        font-size: 14px;
        line-height: 1.4;
      }

      .bot-description.light-mode {
        color: #666;
      }

      .custom-config {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #57534e;
        display: none;
      }

      .custom-config.light-mode {
        border-top-color: #e5e5e5;
      }

      .bot-option.selected .custom-config {
        display: block;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #f5f5f4;
        margin-bottom: 6px;
      }

      .form-label.light-mode {
        color: #1a1a1a;
      }

      .form-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #57534e;
        border-radius: 6px;
        font-size: 14px;
        background: #292524;
        color: #f5f5f4;
        transition: border-color 0.2s;
      }

      .form-input.light-mode {
        background: #fff;
        color: #1a1a1a;
        border-color: #e5e5e5;
      }

      .form-input:focus {
        outline: none;
        border-color: #a8a29e;
      }

      .form-input.light-mode:focus {
        border-color: #999;
      }

      .form-input::placeholder {
        color: #a8a29e;
      }

      .form-input.light-mode::placeholder {
        color: #999;
      }

      .form-input.error {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
      }

      .form-input.light-mode.error {
        border-color: #ef4444;
        background-color: rgba(239, 68, 68, 0.05);
      }

      .form-input.valid {
        border-color: #10b981;
        background-color: rgba(16, 185, 129, 0.1);
      }

      .form-input.light-mode.valid {
        border-color: #10b981;
        background-color: rgba(16, 185, 129, 0.05);
      }

      .button-section {
        border-top: 1px solid #57534e;
        padding: 16px 24px;
        display: flex;
        gap: 16px;
        background: #292524;
      }

      .button-section.light-mode {
        background: #fff;
        border-top-color: #e5e5e5;
      }

      .btn {
        padding: 8px 12px;
        border-radius: 12px;
        font-weight: 500;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        border: none;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
      }

      .btn-primary {
        background: #f5f5f4;
        color: #292524;
      }

      .btn-primary.light-mode {
        background: #1a1a1a;
        color: #fff;
      }

      .btn-primary:hover {
        background: #e7e5e4;
      }

      .btn-primary.light-mode:hover {
        background: #333;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 640px) {
        body {
          padding: 10px;
        }

        .container {
          max-width: 100%;
        }

        .selection-header,
        .selection-content {
          padding: 16px;
        }

        .header-title {
          font-size: 16px;
          margin: 0 12px;
        }

        .button-section {
          padding: 16px;
        }
      }
    </style>
  </head>
  <body>
    <div class="modal-overlay">
      <div class="container" id="main-container">
        <div class="selection-header" id="selection-header">
          <div class="header-logo-section">
            <svg class="slack-logo" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.042 15.165c-1.164 0-2.104-.94-2.104-2.103 0-1.162.94-2.103 2.104-2.103h2.103v2.103c0 1.163-.94 2.103-2.103 2.103zm0-5.582H2.104C.94 9.583 0 8.643 0 7.48s.94-2.103 2.104-2.103h2.938c1.164 0 2.104.94 2.104 2.103s-.94 2.103-2.104 2.103z" fill="#E01E5A"/>
              <path d="M8.896 5.377c0-1.163.94-2.103 2.104-2.103s2.103.94 2.103 2.103v2.103H11c-1.163 0-2.104-.94-2.104-2.103zm5.583 0V2.104C14.479.94 15.419 0 16.583 0c1.163 0 2.103.94 2.103 2.104v2.938c0 1.163-.94 2.103-2.103 2.103-1.164 0-2.104-.94-2.104-2.103z" fill="#36C5F0"/>
              <path d="M18.958 8.896c1.163 0 2.103.94 2.103 2.104s-.94 2.103-2.103 2.103H16.855V11c0-1.163.94-2.104 2.103-2.104zm0 5.583h2.938C23.06 14.479 24 15.419 24 16.583c0 1.163-.94 2.103-2.104 2.103h-2.938c-1.163 0-2.103-.94-2.103-2.103 0-1.164.94-2.104 2.103-2.104z" fill="#2EB67D"/>
              <path d="M15.104 18.958c0 1.163-.94 2.103-2.104 2.103s-2.103-.94-2.103-2.103V16.855H13c1.163 0 2.104.94 2.104 2.103zm-5.583 0v2.938C9.521 23.06 8.581 24 7.417 24c-1.163 0-2.103-.94-2.103-2.104v-2.938c0-1.163.94-2.103 2.103-2.103 1.164 0 2.104.94 2.104 2.103z" fill="#ECB22E"/>
            </svg>
            <span class="header-title">Slack Integration</span>
            <button
              id="theme-toggle"
              title="Toggle theme"
              onclick="toggleTheme()"
            >
              <svg
                id="theme-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  id="theme-icon-path"
                  d="M10 2a8 8 0 0 1 0 16z"
                />
              </svg>
            </button>
          </div>
          <div class="selection-subtitle">
            Choose how you want to integrate with Slack.
          </div>
        </div>

        <div class="selection-content" id="selection-content">
          <!-- Deco.chat Bot Option -->
          <div class="bot-option" id="deco-bot" onclick="selectBot('deco-bot')">
            <div class="bot-option-header">
              <div class="bot-radio">
                <div class="bot-radio-dot"></div>
              </div>
              <div class="bot-title">deco.chat Bot</div>
            </div>
            <div class="bot-description">
              Use the official deco.chat bot for seamless integration. This is the recommended option for most users.
            </div>
          </div>

          <!-- Custom Bot Option -->
          <div class="bot-option" id="custom-bot" onclick="selectBot('custom-bot')">
            <div class="bot-option-header">
              <div class="bot-radio">
                <div class="bot-radio-dot"></div>
              </div>
              <div class="bot-title">Custom Bot</div>
            </div>
            <div class="bot-description">
              Configure your own Slack app with custom credentials and settings.
            </div>
            <div class="custom-config" id="custom-config">
              <div class="form-group">
                <label class="form-label" for="clientId">Client ID</label>
                <input
                  type="text"
                  id="clientId"
                  name="clientId"
                  class="form-input"
                  placeholder="Enter your Slack app Client ID"
                  onclick="event.stopPropagation()"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="clientSecret">Client Secret</label>
                <input
                  type="password"
                  id="clientSecret"
                  name="clientSecret"
                  class="form-input"
                  placeholder="Enter your Slack app Client Secret"
                  onclick="event.stopPropagation()"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="botName">Bot Name (Optional)</label>
                <input
                  type="text"
                  id="botName"
                  name="botName"
                  class="form-input"
                  placeholder="Custom bot identifier"
                  onclick="event.stopPropagation()"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="button-section" id="button-section">
          <button
            class="btn btn-primary"
            id="continue-btn"
            onclick="continueWithSelection()"
            disabled
          >
            Continue
          </button>
        </div>
      </div>
    </div>

    <script>
      const callbackUrl = "{{CALLBACK_URL}}";
      let selectedBotType = null;

      document.addEventListener("DOMContentLoaded", function () {
        const theme = localStorage.getItem("theme") || "light";
        applyTheme(theme);
      });

      function selectBot(botType) {
        selectedBotType = botType;
        
        // Remove selection from all options
        document.querySelectorAll('.bot-option').forEach(option => {
          option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        document.getElementById(botType).classList.add('selected');
        
        // Enable continue button
        updateContinueButton();
      }

      function updateContinueButton() {
        const continueBtn = document.getElementById('continue-btn');
        
        if (!selectedBotType) {
          continueBtn.disabled = true;
          return;
        }

        if (selectedBotType === 'custom-bot') {
          const clientIdInput = document.getElementById('clientId');
          const clientSecretInput = document.getElementById('clientSecret');
          const clientId = clientIdInput.value.trim();
          const clientSecret = clientSecretInput.value.trim();
          
          // Visual feedback for validation
          updateInputValidation(clientIdInput, clientId.length > 0);
          updateInputValidation(clientSecretInput, clientSecret.length > 0);
          
          continueBtn.disabled = !clientId || !clientSecret;
        } else {
          continueBtn.disabled = false;
        }
      }

      function updateInputValidation(input, isValid) {
        input.classList.remove('error', 'valid');
        if (input.value.trim().length > 0) {
          input.classList.add(isValid ? 'valid' : 'error');
        }
      }

      // Add input validation for custom bot fields
      document.addEventListener('DOMContentLoaded', function() {
        const clientIdInput = document.getElementById('clientId');
        const clientSecretInput = document.getElementById('clientSecret');
        
        [clientIdInput, clientSecretInput].forEach(input => {
          input.addEventListener('input', updateContinueButton);
        });
      });

      function continueWithSelection() {
        if (!selectedBotType) {
          alert("Please select an integration type to continue.");
          return;
        }

        const urlParams = new URLSearchParams();
        
        if (selectedBotType === 'deco-bot') {
          urlParams.set('useDecoChatBot', 'true');
        } else if (selectedBotType === 'custom-bot') {
          const clientId = document.getElementById('clientId').value.trim();
          const clientSecret = document.getElementById('clientSecret').value.trim();
          const botName = document.getElementById('botName').value.trim();
          
          if (!clientId || !clientSecret) {
            alert("Please provide both Client ID and Client Secret for custom bot integration.");
            return;
          }
          
          urlParams.set('useCustomBot', 'true');
          urlParams.set('customClientId', clientId);
          urlParams.set('customClientSecret', clientSecret);
          if (botName) {
            urlParams.set('customBotName', botName);
          }
        }
        
        const finalUrl = callbackUrl + '&' + urlParams.toString();
        window.location.href = finalUrl;
      }

      function applyTheme(theme) {
        const elements = [
          document.body,
          document.getElementById('main-container'),
          document.getElementById('selection-header'),
          document.getElementById('selection-content'),
          document.getElementById('button-section'),
          document.querySelector('.header-title'),
          document.querySelector('.selection-subtitle'),
          document.getElementById('continue-btn')
        ];

        const formElements = document.querySelectorAll('.form-label, .form-input');
        const botOptions = document.querySelectorAll('.bot-option');
        const customConfigs = document.querySelectorAll('.custom-config');
        const botTitles = document.querySelectorAll('.bot-title');
        const botDescriptions = document.querySelectorAll('.bot-description');

        if (theme === 'light') {
          elements.forEach(el => el && el.classList.add('light-mode'));
          formElements.forEach(el => el.classList.add('light-mode'));
          botOptions.forEach(el => el.classList.add('light-mode'));
          customConfigs.forEach(el => el.classList.add('light-mode'));
          botTitles.forEach(el => el.classList.add('light-mode'));
          botDescriptions.forEach(el => el.classList.add('light-mode'));
        } else {
          elements.forEach(el => el && el.classList.remove('light-mode'));
          formElements.forEach(el => el.classList.remove('light-mode'));
          botOptions.forEach(el => el.classList.remove('light-mode'));
          customConfigs.forEach(el => el.classList.remove('light-mode'));
          botTitles.forEach(el => el.classList.remove('light-mode'));
          botDescriptions.forEach(el => el.classList.remove('light-mode'));
        }
      }

      function toggleTheme() {
        const current = localStorage.getItem('theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
      }
    </script>
  </body>
</html>
`;

  const processedHtml = htmlTemplate
    .replace('"{{CALLBACK_URL}}"', JSON.stringify(callbackUrl));

  return processedHtml;
}
