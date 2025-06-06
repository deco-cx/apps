# Jira App for deco.cx

Easily connect your Jira Cloud instance to deco.cx and automate issue management, comments, and more.

---

## ✨ Features
- Fetch Jira issues by key
- Add comments to issues
- Ready for automation and workflows in deco.cx

---

## 🚀 Setup

### 1. Create a Jira API Token
1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Name your token and click **Create**
4. Copy and save the token securely

### 2. Find Your Jira Cloud Base URL
- Your base URL is usually: `https://your-domain.atlassian.net`

### 3. Get Your Jira Account Email
- Use the email address associated with your Atlassian account

---

## ⚙️ Configuration

When installing the app, provide:

- **Base URL**: Your Jira Cloud instance URL (e.g., `https://your-domain.atlassian.net`)
- **Email**: Your Atlassian account email
- **API Token**: The API token you generated (use a Secret for security)

---

## 🛠️ Usage

After installing, you can:

- **Fetch an Issue**: Retrieve details for any Jira issue by its key (e.g., `PROJ-123`)
- **Add a Comment**: Post a comment to any Jira issue

These actions can be used in workflows, automations, or directly via the deco.cx admin.

---

## 📚 References
- [Jira Cloud REST API documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [How to create an API token for your Atlassian account](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)

---

## 📝 License
Inspired by the [Slack app template](https://github.com/modelcontextprotocol/servers/tree/main/src/slack) under MIT License. 