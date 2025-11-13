<hr/>  
 
<a href="https://deco.cx/discord" target="_blank"><img alt="Discord" src="https://img.shields.io/discord/985687648595243068?label=Discord&color=7289da" /></a>
&nbsp;
![Build Status](https://github.com/deco-cx/apps/workflows/ci/badge.svg?event=push&branch=main)

<hr/>


# Deco **Apps** Library / MCP Servers

<img align="right" src="/assets/logo.svg" height="150px" alt="The Deco Framework logo: A capybara in its natural habitat">

Welcome to the `deco-cx/apps` repository!  Read more about apps in the [docs](https://www.deco.cx/docs/en/concepts/app).

Check and test apps in https://mcp.deco.site/.

### Create a new app

Open this repo in an AI Editor and use [NewAppPrompt.md](NewAppPrompt.md) as prompt to create a new app. You can use OpenAPI, API docs or even code that explains the service you wish to expose as an app.

---

## Debugging HTTP Requests

To enable verbose HTTP request debugging logs, set the environment variable `DEBUG_HTTP` to `true` when running this repo:

```sh
DEBUG_HTTP=true deno run ...
```

When enabled, this will print curl-like representations of all HTTP requests made by the internal HTTP client.

