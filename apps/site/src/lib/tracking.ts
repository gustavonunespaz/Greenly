/**
 * Analytics & Campaign Tracking Utilities
 * 
 * Ready for Google Ads, Meta (Facebook) Pixel, and custom event tracking.
 * Just uncomment and add your IDs when campaigns go live.
 */

// UTM parameter extraction
export function getUTMParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
  keys.forEach(key => {
    const val = params.get(key)
    if (val) utm[key] = val
  })
  return utm
}

// Store UTM params in sessionStorage for form attribution
export function storeUTMParams(): void {
  const utm = getUTMParams()
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem('greenly_utm', JSON.stringify(utm))
  }
}

// Retrieve stored UTMs for lead form submission
export function getStoredUTMs(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem('greenly_utm') || '{}')
  } catch {
    return {}
  }
}

// Google Ads conversion tracking
export function trackGoogleConversion(conversionId?: string): void {
  if (typeof window !== 'undefined' && conversionId) {
    // @ts-expect-error gtag is loaded externally
    window.gtag?.('event', 'conversion', {
      send_to: conversionId,
    })
  }
}

// Meta (Facebook) Pixel tracking
export function trackMetaEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    // @ts-expect-error fbq is loaded externally
    window.fbq?.('track', eventName, params)
  }
}

// Generic event tracking (can be wired to any analytics platform)
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  // Log for development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, properties)
  }
  
  // Wire to Google Analytics
  // @ts-expect-error gtag is loaded externally
  window.gtag?.('event', event, properties)
  
  // Wire to Meta Pixel
  // @ts-expect-error fbq is loaded externally
  window.fbq?.('trackCustom', event, properties)
}

// Track CTA clicks with campaign context
export function trackCTA(ctaName: string, section: string): void {
  trackEvent('cta_click', {
    cta_name: ctaName,
    section,
    ...getStoredUTMs(),
    page_url: window.location.href,
    timestamp: new Date().toISOString(),
  })
}

// Track lead form submission
export function trackLeadSubmission(formName: string, data?: Record<string, string>): void {
  trackEvent('lead_form_submit', {
    form_name: formName,
    ...getStoredUTMs(),
    ...data,
  })
  
  // Google Ads lead conversion
  trackGoogleConversion(import.meta.env.VITE_GOOGLE_ADS_LEAD_CONVERSION_ID)
  
  // Meta lead event
  trackMetaEvent('Lead', { content_name: formName })
}

// Initialize tracking on page load
export function initTracking(): void {
  storeUTMParams()
  trackEvent('page_view', {
    page: window.location.pathname,
    referrer: document.referrer,
    ...getStoredUTMs(),
  })
}
