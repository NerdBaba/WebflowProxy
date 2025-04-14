// Configuration for the Webflow proxy
export const config = {
  // The Webflow domain to proxy
  webflowDomain: "emerald-portfolio.webflow.io",
  
  // Optional: Custom headers to add to the proxied requests
  headers: {
    "X-Proxied-By": "Cloudflare Pages"
  }
}; 