/**
 * Dynamically updates the browser tab icon (favicon) and mobile bookmark icon
 * based on the active sanctuary settings configured in the Admin Dashboard.
 */
export function updateDynamicFavicon(iconUrl?: string | null): void {
  if (typeof document === 'undefined' || !iconUrl) return;

  try {
    // 1. Update or create standard icon links
    const iconSelectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='alternate icon']",
    ];

    let foundIcon = false;
    iconSelectors.forEach((selector) => {
      const links = document.querySelectorAll<HTMLLinkElement>(selector);
      links.forEach((link) => {
        link.href = iconUrl;
        foundIcon = true;
      });
    });

    if (!foundIcon) {
      const newIcon = document.createElement('link');
      newIcon.rel = 'icon';
      newIcon.href = iconUrl;
      document.head.appendChild(newIcon);
    }

    // 2. Update apple touch icon for iOS / Safari bookmarks
    let appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = iconUrl;
  } catch (err) {
    console.warn('[FAVICON] Failed to update dynamic favicon:', err);
  }
}
