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
        </div>
      </div>

      <div class="error" id="errorMsg"></div>
      <button type="submit" class="btn" id="submitBtn" disabled>Continue</button>
    </form>
  </div>

  <script>
    // Sanitize the current URL to prevent XSS attacks
    const sanitizedJSCurrentUrl = ${JSON.stringify(currentUrl)};
    
    let selectedType = null;
    const form = document.getElementById('botForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');
    const customForm = document.getElementById('customForm');

    function selectDecoBot() {
      selectedType = 'deco';
      customForm.style.display = 'none';
      submitBtn.disabled = false;
      updateFormAction();
    }

    function selectCustomBot() {
      selectedType = 'custom';
      customForm.style.display = 'block';
      validateCustomForm();
    }

    function validateCustomForm() {
      const clientId = document.getElementById('clientId').value.trim();
      const clientSecret = document.getElementById('clientSecret').value.trim();
      submitBtn.disabled = !clientId || !clientSecret;
      updateFormAction();
    }

    function updateFormAction() {
      if (selectedType === 'deco') {
        const url = new URL(sanitizedJSCurrentUrl);
        url.searchParams.set('useDecoChatBot', 'true');
        form.action = url.toString();
      } else if (selectedType === 'custom') {
        // Will be handled by form submission
        form.action = '';
      }
    }

    // Add input validation for custom form
    ['clientId', 'clientSecret'].forEach(id => {
      document.getElementById(id).addEventListener('input', validateCustomForm);
    });

    form.addEventListener('submit', async function(e) {
      if (selectedType === 'custom') {
        e.preventDefault();
        
        const clientId = document.getElementById('clientId').value.trim();
        const clientSecret = document.getElementById('clientSecret').value.trim();
        const botName = document.getElementById('botName').value.trim();

        if (!clientId || !clientSecret) {
          showError('Please provide both Client ID and Client Secret');
          return;
        }

        try {
          submitBtn.textContent = 'Processing...';
          submitBtn.disabled = true;

          // Store credentials via POST request
          const response = await fetch(sanitizedJSCurrentUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'storeCredentials',
              clientId: clientId,
              clientSecret: clientSecret,
              botName: botName
            })
          });

          const result = await response.json();

          if (result.success) {
            // Redirect with session token
            const url = new URL(sanitizedJSCurrentUrl);
            url.searchParams.set('useCustomBot', 'true');
            url.searchParams.set('sessionToken', result.sessionToken);
            window.location.href = url.toString();
          } else {
            showError(result.error || 'Failed to store credentials');
            submitBtn.textContent = 'Continue';
            submitBtn.disabled = false;
          }
        } catch (error) {
          showError('Network error: ' + error.message);
          submitBtn.textContent = 'Continue';
          submitBtn.disabled = false;
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
