# Webflow Proxy

[![Deploy to Cloudflare Pages](https://github.com/user/webflow-proxy/actions/workflows/deploy.yml/badge.svg)](https://github.com/user/webflow-proxy/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Cloudflare Pages project that proxies a Webflow site while removing the Webflow badge. This allows you to serve a Webflow-designed site through your own domain without the "Made in Webflow" badge.

## Features

- 🔄 Proxies any Webflow site through Cloudflare Pages
- 🚫 Removes the "Made in Webflow" badge completely
- 🌐 Works with custom domains through Cloudflare Pages
- ⚡ Fast and reliable with Cloudflare's global CDN
- 🛡️ Free SSL/TLS encryption
- 🔧 Easy to configure and deploy

## Quick Start

### Option 1: Deploy with GitHub

1. Fork this repository
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Navigate to Workers & Pages > Create application > Pages > Connect to Git
4. Select your forked repository
5. Configure your project:
   - Production branch: `main`
   - Build command: Leave empty
   - Build directory: Leave empty
6. Click "Save and Deploy"
7. Set up environment variables in Cloudflare Dashboard:
   - `WEBFLOW_DOMAIN`: Your Webflow site's domain (e.g., `your-site.webflow.io`)

### Option 2: Deploy with Wrangler CLI

1. Clone the repository:
   ```bash
   git clone https://github.com/user/webflow-proxy.git
   cd webflow-proxy
   ```

2. Update `config.js` with your Webflow domain:
   ```js
   export const config = {
     webflowDomain: "your-site.webflow.io",
     // ...
   };
   ```

3. Install dependencies (if Node.js is available):
   ```bash
   npm install
   ```

4. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy
   ```

## Configuration

### Webflow Domain

Update the `config.js` file with your Webflow domain:

```js
export const config = {
  // Replace with your Webflow site domain
  webflowDomain: "emerald-portfolio.webflow.io",
  
  // Optional: Custom headers to add to the proxied requests
  headers: {
    "X-Proxied-By": "Cloudflare Pages"
  }
};
```

### Custom Domains

To use a custom domain with your proxied Webflow site:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to Workers & Pages > Your Pages Project > Custom domains
3. Follow the instructions to set up your custom domain

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (for local development)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Local Development

To run the proxy locally:

```bash
npx wrangler pages dev
```

This will start a local development server, typically at http://localhost:8788.

## How It Works

This proxy uses Cloudflare Pages Functions to:

1. Receive requests for your site
2. Forward them to your Webflow site
3. Modify the HTML response to remove the Webflow badge
4. Return the modified content to your visitors

The badge removal happens through multiple techniques:
- Regex patterns to target and remove the badge HTML
- CSS that hides any badges that might be added dynamically
- JavaScript that continuously removes any badges after page load

## GitHub Actions

This project includes a GitHub Actions workflow that automatically deploys your site to Cloudflare Pages whenever you push to the main branch.

To use this workflow, add the following secrets to your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages deployment permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Troubleshooting

### Badge Still Showing

If the Webflow badge is still visible:

1. Check your browser's developer tools for any errors
2. Clear your browser cache and reload
3. Verify the proxy is correctly intercepting the badge in the HTML

### 403 Forbidden or Other Errors

If you're getting access errors:

1. Ensure your Webflow site is published and publicly accessible
2. Check that your Cloudflare Pages project has the correct environment variables
3. Verify your Webflow domain in `config.js` is correct

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 