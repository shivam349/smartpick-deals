/**
 * Cuelinks Monetization Layer
 * 
 * Configured in disconnected/fallback mode per current project requirements.
 * When enabled in the future, merchant URLs are wrapped with tracking IDs.
 */

export function getAffiliateUrl(originalMerchantUrl: string, _subid = "nextjs_web"): string {
  // Disconnected mode: Return the clean direct merchant URL directly
  const cuelinksEnabled = process.env.CUELINKS_ENABLED === "true";
  const apiKey = process.env.CUELINKS_API_KEY;

  if (cuelinksEnabled && apiKey) {
    // When activated, route through conversion redirect
    return `/api/redirect?url=${encodeURIComponent(originalMerchantUrl)}`;
  }

  return originalMerchantUrl;
}
