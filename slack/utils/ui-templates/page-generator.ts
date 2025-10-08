export interface SlackWorkspace {
  id: string;
  name: string;
  domain?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_mpim?: boolean;
  is_private?: boolean;
  workspaceId?: string;
}

export interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
}

export interface SelectionPageOptions {
  workspace: SlackWorkspace;
  channels: SlackChannel[];
  user: SlackUser;
  callbackUrl: string;
}

/**
 * Generates a clean, server-side bot selection page for Slack OAuth
 */
export function generateBotSelectionPage(currentUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slack Integration Setup</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Inter, system-ui, sans-serif;
      margin: 0; padding: 20px;
      background: #f5f5f4; color: #1a1a1a;
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center;
    }
    .container {
      width: 400px; background: #fff;
      border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.1);
      border: 1px solid #e5e5e5;
    }
    .header {
      text-align: center; margin-bottom: 24px;
    }
    .title {
      font-size: 18px; font-weight: 600;
      margin: 0 0 8px 0;
    }
    .subtitle {
      color: #666; font-size: 14px; margin: 0;
    }
    .option {
      border: 1px solid #e5e5e5; border-radius: 12px;
      padding: 16px; margin-bottom: 16px; cursor: pointer;
      transition: all 0.2s; background: #fff;
    }
    .option:hover {
      background: #f5f5f4; border-color: #999;
    }
    .option-title { font-weight: 600; margin-bottom: 4px; }
    .option-desc { color: #666; font-size: 14px; line-height: 1.4; }
    .custom-form {
      margin-top: 16px; padding-top: 16px;
      border-top: 1px solid #e5e5e5; display: none;
    }
    .form-group { margin-bottom: 12px; }
    .form-label {
      display: block; font-size: 14px; font-weight: 500;
      margin-bottom: 4px;
    }
    .form-input {
      width: 100%; padding: 8px 12px;
      border: 1px solid #e5e5e5; border-radius: 6px;
      font-size: 14px; background: #fff;
    }
    .form-input:focus {
      outline: none; border-color: #999;
    }
    .btn {
      width: 100%; padding: 12px; border: none;
      border-radius: 12px; font-weight: 500;
      cursor: pointer; font-size: 14px;
      background: #1a1a1a; color: #fff;
      transition: all 0.2s;
    }
    .btn:hover { background: #333; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error {
      color: #ef4444; font-size: 14px;
      margin-top: 8px; display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Slack Integration</h1>
      <p class="subtitle">Choose how you want to integrate with Slack</p>
    </div>

    <form id="botForm" method="get">
      <!-- deco.chat Bot Option -->
      <div class="option" onclick="selectDecoBot()">
        <div class="option-title">deco.chat Bot</div>
        <div class="option-desc">
          Use the official deco.chat bot for seamless integration. Recommended for most users.
        </div>
        <div id="decoForm" style="display: none;">
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="debugMode" name="debugMode" style="margin-right: 8px;">
              Show tool calls in Slack (for developers)
            </label>
          </div>
        </div>
      </div>

      <!-- Custom Bot Option -->
      <div class="option" onclick="selectCustomBot()">
        <div class="option-title">Custom Bot</div>
        <div class="option-desc">
          Configure your own Slack bot with custom settings and permissions.
        </div>
        <div id="customForm" class="custom-form">
          <div class="form-group">
            <label class="form-label" for="clientId">Client ID</label>
            <input type="text" id="clientId" name="clientId" class="form-input" placeholder="xoxb-your-bot-token" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="clientSecret">Client Secret</label>
            <input type="password" id="clientSecret" name="clientSecret" class="form-input" placeholder="Your client secret" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="botName">Bot Name</label>
            <input type="text" id="botName" name="botName" class="form-input" placeholder="My Custom Bot" required>
          </div>
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="debugModeCustom" name="debugMode" style="margin-right: 8px;">
              Show tool calls in Slack (for developers)
            </label>
          </div>
        </div>
      </div>

      <div class="error" id="errorMsg"></div>
      <button type="submit" class="btn" id="submitBtn" disabled>Continue</button>
    </form>
  </div>

  <script>
    // Sanitize the current URL to prevent XSS attacks
    const sanitizedJSCurrentUrl = \${JSON.stringify(currentUrl)};
    
    let selectedType = null;
    const form = document.getElementById('botForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');
    const customForm = document.getElementById('customForm');
    const decoForm = document.getElementById('decoForm');

    function selectDecoBot() {
      selectedType = 'deco';
      customForm.style.display = 'none';
      decoForm.style.display = 'block';
      submitBtn.disabled = false;
      updateFormAction();
    }

    function selectCustomBot() {
      selectedType = 'custom';
      decoForm.style.display = 'none';
      customForm.style.display = 'block';
      validateCustomForm();
    }

    function validateCustomForm() {
      const clientId = document.getElementById('clientId').value.trim();
      const clientSecret = document.getElementById('clientSecret').value.trim();
      const botName = document.getElementById('botName').value.trim();
      
      const isValid = clientId && clientSecret && botName;
      submitBtn.disabled = !isValid;
      
      if (isValid) {
        updateFormAction();
      }
    }

    function updateFormAction() {
      if (selectedType === 'deco') {
        form.action = sanitizedJSCurrentUrl + (sanitizedJSCurrentUrl.includes('?') ? '&' : '?') + 'type=deco';
      } else if (selectedType === 'custom') {
        const clientId = document.getElementById('clientId').value.trim();
        const clientSecret = document.getElementById('clientSecret').value.trim();
        const botName = document.getElementById('botName').value.trim();
        const debugMode = document.getElementById('debugModeCustom').checked;
        
        let params = \`type=custom&clientId=\${encodeURIComponent(clientId)}&clientSecret=\${encodeURIComponent(clientSecret)}&botName=\${encodeURIComponent(botName)}\`;
        if (debugMode) {
          params += '&debugMode=true';
        }
        
        form.action = sanitizedJSCurrentUrl + (sanitizedJSCurrentUrl.includes('?') ? '&' : '?') + params;
      }
    }

    // Add event listeners
    document.getElementById('clientId').addEventListener('input', validateCustomForm);
    document.getElementById('clientSecret').addEventListener('input', validateCustomForm);
    document.getElementById('botName').addEventListener('input', validateCustomForm);
    
    form.addEventListener('submit', function(e) {
      if (!selectedType) {
        e.preventDefault();
        showError('Please select a bot type');
        return;
      }
      
      if (selectedType === 'custom') {
        const clientId = document.getElementById('clientId').value.trim();
        const clientSecret = document.getElementById('clientSecret').value.trim();
        const botName = document.getElementById('botName').value.trim();
        
        if (!clientId || !clientSecret || !botName) {
          e.preventDefault();
          showError('Please fill in all required fields');
          return;
        }
      }
    });

    function showError(message) {
      errorMsg.textContent = message;
      errorMsg.style.display = 'block';
    }
  </script>
</body>
</html>`;
}

export function generateSelectionPage(
  { workspace, channels, user, callbackUrl }: SelectionPageOptions,
): string {
  let htmlTemplate: string;

  try {
    htmlTemplate = `
<!-- ignore -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Connector - Slack Access</title>
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
        background: rgba(41, 37, 36, 0.3);
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
        height: 572px;
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

      .close-button {
        position: absolute;
        width: 16px;
        height: 16px;
        right: 16px;
        top: 16px;
        background: transparent;
        border: none;
        cursor: pointer;
        opacity: 0.7;
        border-radius: 2px;
        flex: none;
        order: 0;
        flex-grow: 0;
        z-index: 10;
      }

      #theme-toggle {
        color: #f5f5f4;
      }

      #theme-toggle:hover {
        opacity: 0.8;
      }

      .light-mode #theme-toggle {
        color: #1a1a1a;
      }

      /* Theme icon styling */
      #theme-icon-path {
        transition: fill 0.2s ease;
      }

      /* Dark mode: half-circle is white */
      #theme-icon-path {
        fill: #f5f5f4;
      }

      /* Light mode: half-circle is black */
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
        padding: 0px 24px 24px 24px;
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .selection-content.light-mode {
        background: #fff;
      }

      .workspace-info {
        margin-bottom: 16px;
        padding: 16px;
        background: #292524;
        border-radius: 8px;
        border: 1px solid #57534e;
      }

      .workspace-info.light-mode {
        background: #fff;
        border: 1px solid #e5e5e5;
      }

      .workspace-name {
        font-weight: 600;
        color: #f5f5f4;
        margin-bottom: 4px;
      }

      .workspace-name.light-mode {
        color: #1a1a1a;
      }

      .workspace-domain {
        color: #a8a29e;
        font-size: 14px;
      }

      .workspace-domain.light-mode {
        color: #666;
      }

      .user-info {
        color: #a8a29e;
        font-size: 14px;
        margin-top: 4px;
      }

      .user-info.light-mode {
        color: #666;
      }

      .channels-section {
        flex: 1;
        margin-bottom: 16px;
      }

      .channels-title {
        font-weight: 600;
        color: #f5f5f4;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .channels-title.light-mode {
        color: #1a1a1a;
      }

      .channels-list {
        background: #292524;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #57534e;
        max-height: 200px;
        overflow-y: auto;
      }

      .channels-list.light-mode {
        background: #fff;
        border: 1px solid #e5e5e5;
      }

      .channel-item {
        padding: 8px 12px;
        border-bottom: 1px solid #404040;
        color: #f5f5f4;
        font-size: 14px;
      }

      .channel-item:last-child {
        border-bottom: none;
      }

      .channel-item.light-mode {
        color: #1a1a1a;
        border-bottom: 1px solid #e5e5e5;
      }

      .channel-name {
        font-weight: 500;
      }

      .channel-type {
        color: #a8a29e;
        font-size: 12px;
        margin-left: 8px;
      }

      .channel-type.light-mode {
        color: #666;
      }

      .no-channels {
        text-align: center;
        padding: 24px 16px;
        color: #737373;
        font-size: 14px;
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
      }

      .no-channels.light-mode {
        color: #999;
      }

      .button-section {
        border-top: 1px solid #737373;
        padding: 16px 24px;
        display: flex;
        gap: 16px;
        background: #292524;
      }

      .button-section.light-mode {
        background: #fff;
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
        padding: 8px 12px;
      }

      .btn-primary.light-mode {
        background: #1a1a1a;
        color: #fff;
        border: none;
      }

      .btn-primary:hover {
        background: #e7e5e4;
      }

      .btn-primary.light-mode:hover {
        background: #333;
      }

      .btn-secondary {
        background: transparent;
        color: #a8a29e;
        border: 1px solid #404040;
      }

      .btn-secondary.light-mode {
        background: #fff;
        color: #1a1a1a;
        border: 1px solid #e5e5e5;
      }

      .btn-secondary:hover {
        background: #404040;
        color: #f5f5f4;
      }

      .btn-secondary.light-mode:hover {
        background: #f5f5f4;
        color: #1a1a1a;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .channels-list::-webkit-scrollbar {
        width: 6px;
      }

      .channels-list.light-mode::-webkit-scrollbar {
        width: 6px;
      }

      .channels-list::-webkit-scrollbar-track {
        background: #404040;
      }

      .channels-list.light-mode::-webkit-scrollbar-track {
        background: #e5e5e5;
      }

      .channels-list::-webkit-scrollbar-thumb {
        background: #525252;
        border-radius: 3px;
      }

      .channels-list.light-mode::-webkit-scrollbar-thumb {
        background: #d4d4d4;
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
          flex-direction: column;
          padding: 16px;
        }

        .btn {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="modal-overlay">
      <div class="container" id="main-container">
        <div class="selection-header" id="selection-header">
          <div class="header-logo-section">
            <svg
              class="slack-logo"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M3.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM8.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM12 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM14.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM17 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM3.5 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM8.5 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM12 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM14.5 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM17 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
              />
            </svg>
            <span class="header-title">Slack</span>
            <button
              id="theme-toggle"
              style="margin-left: auto; background: transparent; border: none; cursor: pointer"
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
            Review your Slack workspace access and available channels.
          </div>
        </div>

        <div class="selection-content">
          <div class="workspace-info">
            <div class="workspace-name" id="workspace-name">{{WORKSPACE_NAME}}</div>
            <div class="workspace-domain">{{WORKSPACE_DOMAIN}}.slack.com</div>
            <div class="user-info">Connected as: {{USER_NAME}}</div>
          </div>

          <div class="channels-section">
            <div class="channels-title">Available Channels ({{CHANNELS_COUNT}})</div>
            <div class="channels-list" id="channels-list">
              {{CHANNELS_LIST}}
            </div>
            {{MORE_CHANNELS_MESSAGE}}
          </div>
        </div>

        <div class="button-section">
          <button
            class="btn btn-secondary"
            id="restrict-btn"
            onclick="confirmSelection()"
          >
            Configure Access
          </button>
          <button
            class="btn btn-primary"
            id="continue-btn"
            onclick="skipSelection()"
          >
            Continue
          </button>
        </div>
      </div>
    </div>

    <script>
      const workspaceData = "{{WORKSPACE_DATA}}";
      const channelsData = "{{CHANNELS_DATA}}";
      const userData = "{{USER_DATA}}";
      const callbackUrl = "{{CALLBACK_URL}}";

      let workspace, channels, user;
      try {
        workspace = typeof workspaceData === "string"
          ? JSON.parse(workspaceData)
          : workspaceData;
        channels = typeof channelsData === "string"
          ? JSON.parse(channelsData)
          : channelsData;
        user = typeof userData === "string"
          ? JSON.parse(userData)
          : userData;
      } catch (e) {
        workspace = workspaceData;
        channels = channelsData;
        user = userData;
      }

      document.addEventListener("DOMContentLoaded", function () {
        const theme = localStorage.getItem("theme") || "light";
        applyTheme(theme);
      });

      function skipSelection() {
        const urlParams = new URLSearchParams();
        urlParams.set("continue", "true");
        window.location.href = callbackUrl + "&" + urlParams.toString();
      }

      function confirmSelection() {
        const permissionsData = {
          workspace: {
            id: workspace.id,
            name: workspace.name,
          },
          channels: channels.map(ch => ({
            id: ch.id,
            name: ch.name,
            is_private: ch.is_private,
          })),
          user: {
            id: user.id,
            name: user.name,
          },
          timestamp: new Date().toISOString(),
        };

        const permissionsEncoded = btoa(
          JSON.stringify(permissionsData),
        );

        const urlParams = new URLSearchParams();
        urlParams.set("savePermission", "true");
        urlParams.set("permissions", permissionsEncoded);

        const finalUrl = callbackUrl + "&" + urlParams.toString();
        window.location.href = finalUrl;
      }

      function applyTheme(theme) {
        const body = document.body;
        const container = document.getElementById("main-container");
        const header = document.getElementById("selection-header");
        const content = document.querySelector(".selection-content");
        const buttonSection = document.querySelector(".button-section");
        const workspaceInfo = document.querySelector(".workspace-info");
        const channelsList = document.getElementById("channels-list");
        const workspaceName = document.getElementById("workspace-name");
        const headerTitle = document.querySelector(".header-title");
        const subtitle = document.querySelector(".selection-subtitle");
        const restrictBtn = document.getElementById("restrict-btn");
        const continueBtn = document.getElementById("continue-btn");
        const themeIcon = document.getElementById("theme-icon");
        const themeIconPath = document.getElementById("theme-icon-path");

        if (theme === "light") {
          body.classList.add("light-mode");
          container.classList.add("light-mode");
          header.classList.add("light-mode");
          content.classList.add("light-mode");
          buttonSection.classList.add("light-mode");
          if (workspaceInfo) workspaceInfo.classList.add("light-mode");
          if (channelsList) channelsList.classList.add("light-mode");
          if (workspaceName) workspaceName.classList.add("light-mode");
          if (headerTitle) headerTitle.classList.add("light-mode");
          if (subtitle) subtitle.classList.add("light-mode");
          if (restrictBtn) restrictBtn.classList.add("light-mode");
          if (continueBtn) continueBtn.classList.add("light-mode");
        } else {
          body.classList.remove("light-mode");
          container.classList.remove("light-mode");
          header.classList.remove("light-mode");
          content.classList.remove("light-mode");
          buttonSection.classList.remove("light-mode");
          if (workspaceInfo) workspaceInfo.classList.remove("light-mode");
          if (channelsList) channelsList.classList.remove("light-mode");
          if (workspaceName) workspaceName.classList.remove("light-mode");
          if (headerTitle) headerTitle.classList.remove("light-mode");
          if (subtitle) subtitle.classList.remove("light-mode");
          if (restrictBtn) restrictBtn.classList.remove("light-mode");
          if (continueBtn) continueBtn.classList.remove("light-mode");
        }
      }

      function toggleTheme() {
        const current = localStorage.getItem("theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        localStorage.setItem("theme", next);
        applyTheme(next);
      }
    </script>
  </body>
</html>
`;
  } catch (error) {
    console.error("Failed to read HTML template:", error);
    return generateFallbackPage({ workspace, channels, user, callbackUrl });
  }

  const processedHtml = htmlTemplate
    .replace("{{WORKSPACE_DATA}}", JSON.stringify(workspace))
    .replace("{{CHANNELS_DATA}}", JSON.stringify(channels))
    .replace("{{USER_DATA}}", JSON.stringify(user))
    .replace("{{CALLBACK_URL}}", JSON.stringify(callbackUrl))
    .replace("{{WORKSPACE_NAME}}", workspace.name)
    .replace("{{WORKSPACE_DOMAIN}}", workspace.domain || "")
    .replace("{{USER_NAME}}", user.real_name || user.name)
    .replace("{{CHANNELS_COUNT}}", channels.length.toString())
    .replace("{{CHANNELS_LIST}}", generateChannelsList(channels))
    .replace(
      "{{MORE_CHANNELS_MESSAGE}}",
      channels.length > 50
        ? '<p class="no-channels">Showing first 50 channels. Configure access to see all.</p>'
        : "",
    );

  return processedHtml;
}

function generateChannelsList(channels: SlackChannel[]): string {
  if (channels.length === 0) {
    return '<div class="no-channels">No channels found</div>';
  }

  // Limit to first 50 channels for display
  const displayChannels = channels.slice(0, 50);

  return displayChannels.map((channel) => {
    const channelType = channel.is_private ? "Private" : "Public";
    const typeClass = channel.is_private ? "private" : "public";

    return `
      <div class="channel-item">
        <div class="channel-name">#${channel.name}</div>
        <div class="channel-type ${typeClass}">${channelType}</div>
      </div>
    `;
  }).join("");
}

function generateFallbackPage(
  { workspace, channels, user, callbackUrl }: SelectionPageOptions,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCP Connector - Slack Access</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 32rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
      margin: 8px;
      border: 1px solid transparent;
    }
    .btn-primary {
      background: #4a154b;
      color: white;
      border-color: #4a154b;
    }
    .btn-secondary {
      background: white;
      color: #374151;
      border-color: #d1d5db;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>MCP Connector - Slack Access</h2>
    <p>Template file not found. Using fallback interface.</p>
    <p>Connected to workspace: <strong>${workspace.name}</strong></p>
    <p>User: <strong>${user.real_name || user.name}</strong></p>
    <p>Found ${channels.length} channels.</p>
    <div>
      <button class="btn btn-secondary" onclick="window.location.href='${callbackUrl}&skip=true'">
        Skip configuration
      </button>
      <button class="btn btn-primary" onclick="window.location.href='${callbackUrl}&isSaveBase=true'">
        Continue
      </button>
    </div>
  </div>
        <div class="custom-form" id="decoForm" style="display: none;">
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="decoDebugMode" name="decoDebugMode" style="margin-right: 8px;">
              Show tool calls in Slack (for developers)
            </label>
          </div>
        </div>
      </div>

      <!-- Custom Bot Option -->
      <div class="option" onclick="selectCustomBot()">
        <div class="option-title">Custom Bot</div>
        <div class="option-desc">
          Configure your own Slack app with custom credentials and settings.
        </div>
        <div class="custom-form" id="customForm">
          <div class="form-group">
            <label class="form-label" for="clientId">Client ID</label>
            <input type="text" id="clientId" name="clientId" class="form-input" 
                   placeholder="Enter your Slack app Client ID" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="clientSecret">Client Secret</label>
            <input type="password" id="clientSecret" name="clientSecret" class="form-input" 
                   placeholder="Enter your Slack app Client Secret" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="botName">Bot Name (Optional)</label>
            <input type="text" id="botName" name="botName" class="form-input" 
                   placeholder="Custom bot identifier">
          </div>
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" id="debugMode" name="debugMode" style="margin-right: 8px;">
              Show tool calls in Slack (for developers)
            </label>
          </div>
        </div>
      </div>

      <div class="error" id="errorMsg"></div>
      <button type="submit" class="btn" id="submitBtn" disabled>Continue</button>
    </form>
  </div>

  </script>
</body>
</html>`;
}
