# Browserless App

This is a deco app for Browserless API, which provides production-ready APIs for browser automation tasks.

## API Endpoints

Browserless has production-ready APIs that you can use depending on your use-case:

### Browser APIs

The Browser APIs help you execute specific tasks for your use-case:

* `/content` - Returns HTML of dynamic content
* `/download` - Returns files Chrome has downloaded
* `/screenshot` - Captures a .png, .jpg, or .webp of a page
* `/pdf` - Exports a page as a PDF
* `/scrape` - Returns structured JSON data from a page
* `/function` - Runs HTTP requests without installing a library
* `/unblock` - Returns HTML, screenshots or cookies for protected sites
* `/performance` - Runs parallel Google Lighthouse tests

### Management APIs

Enterprise customers can use these APIs to monitor their deployment:

* `/sessions` - Gathers information about currently running sessions
* `/metrics` - Provides information about worker configuration
* `/config` - Retrieves an array of session statistics

## Authentication

To authenticate API calls, you need to provide an API key. This key is passed as a query parameter (`?token=YOUR_API_KEY`) rather than as a bearer token in the Authorization header. You can set the `token` property when using this app, and the client will automatically add it to requests.
