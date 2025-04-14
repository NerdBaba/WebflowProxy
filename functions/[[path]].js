import { config } from '../config.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Create the URL for the Webflow site
  const webflowUrl = new URL(`https://${config.webflowDomain}`);
  webflowUrl.pathname = url.pathname;
  webflowUrl.search = url.search;
  
  // Create a new headers object to modify headers
  const newHeaders = new Headers();
  
  // Copy selected headers from the original request
  // Omit headers that might trigger security measures
  for (const [key, value] of request.headers.entries()) {
    if (!['origin', 'referer', 'host', 'cf-connecting-ip', 'cf-ipcountry', 'cf-ray'].includes(key.toLowerCase())) {
      newHeaders.set(key, value);
    }
  }
  
  // Set headers that make the request look like it's coming from a browser
  newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  newHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
  newHeaders.set('Accept-Language', 'en-US,en;q=0.9');
  newHeaders.set('Referer', `https://${config.webflowDomain}`);
  newHeaders.set('sec-ch-ua', '"Google Chrome";v="91", "Chromium";v="91", ";Not A Brand";v="99"');
  newHeaders.set('sec-ch-ua-mobile', '?0');
  
  // Forward the request to Webflow
  let response = await fetch(webflowUrl.toString(), {
    method: request.method,
    headers: newHeaders,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    redirect: 'follow',
  });
  
  // Clone the response to modify it
  const originalResponse = response.clone();
  
  // Create headers for our response
  const responseHeaders = new Headers(response.headers);
  
  // Remove headers that might cause issues
  const headersToRemove = [
    'x-frame-options',
    'content-security-policy',
    'strict-transport-security'
  ];
  
  headersToRemove.forEach(header => {
    if (responseHeaders.has(header)) {
      responseHeaders.delete(header);
    }
  });
  
  // Check if the response is HTML
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    try {
      // Get the HTML content
      let html = await originalResponse.text();
      
      // Remove the Webflow badge - using a more comprehensive approach
      // First attempt: Target by class name with flexible matching
      html = html.replace(
        /<a\s+class=(["'])w-webflow-badge\1[^>]*>[\s\S]*?<\/a>/gi, 
        ''
      );
      
      // Second attempt: Target by the specific URLs in the badge
      html = html.replace(
        /<a[^>]*href=(["'])https:\/\/webflow\.com\?utm_campaign=brandjs\1[^>]*>[\s\S]*?<\/a>/gi,
        ''
      );
      
      // Third attempt: Target by the image sources
      html = html.replace(
        /<a[^>]*>[^<]*<img[^>]*webflow-badge[^>]*>[^<]*<img[^>]*webflow-badge[^>]*>[^<]*<\/a>/gi,
        ''
      );
      
      // Also remove any JavaScript that might inject the badge
      html = html.replace(
        /<script[^>]*>[\s\S]*?webflow[\s\S]*?badge[\s\S]*?<\/script>/gi,
        ''
      );
      
      // Inject CSS to hide the badge in case it's added dynamically
      const badgeRemovalCSS = `
        <style>
          .w-webflow-badge, 
          a[href*="webflow.com?utm_campaign=brandjs"],
          a[href*="webflow.com"] img[src*="webflow-badge"],
          img[src*="webflow-badge"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -9999px !important;
          }
        </style>
      `;
      
      // Insert the CSS into the head of the document
      html = html.replace('</head>', `${badgeRemovalCSS}</head>`);
      
      // Add JavaScript to remove the badge after the page loads
      const badgeRemovalScript = `
        <script>
          // Function to remove the Webflow badge
          function removeWebflowBadge() {
            // Remove by class
            const badgesByClass = document.querySelectorAll('.w-webflow-badge');
            badgesByClass.forEach(badge => badge.remove());
            
            // Remove by href attribute
            const badgesByHref = document.querySelectorAll('a[href*="webflow.com"]');
            badgesByHref.forEach(badge => badge.remove());
            
            // Remove by image source
            const badgeImages = document.querySelectorAll('img[src*="webflow-badge"]');
            badgeImages.forEach(img => {
              const parent = img.closest('a');
              if (parent) parent.remove();
              else img.remove();
            });
          }
          
          // Run on page load
          document.addEventListener('DOMContentLoaded', removeWebflowBadge);
          
          // Run after a short delay to catch dynamically added badges
          setTimeout(removeWebflowBadge, 1000);
          
          // Run periodically to catch any badges added later
          setInterval(removeWebflowBadge, 3000);
        </script>
      `;
      
      // Insert the script right before the closing body tag
      html = html.replace('</body>', `${badgeRemovalScript}</body>`);
      
      // Fix any absolute URLs to resources
      html = html.replace(
        new RegExp(`(href|src)=["'](https?:)?//${config.webflowDomain}`, 'g'),
        `$1="${url.protocol}//${url.host}`
      );
      
      // Create a new response with the modified HTML
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error('Error processing HTML:', error);
      return new Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }
  }
  
  // Return the original response for non-HTML content but with modified headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
} 