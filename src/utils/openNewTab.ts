/**
 * Utility to reliably open a target URL in a new browser tab/window.
 * Handles desktop browsers, mobile devices, and iframe environments gracefully.
 */
export const openInNewTab = (pathOrUrl: string) => {
  if (typeof window === 'undefined') return;

  const targetUrl = pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
    ? pathOrUrl
    : `${window.location.origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

  try {
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.focus();
      return;
    }
  } catch (err) {
    console.warn('[Navigation] window.open intercepted, using anchor fallback:', err);
  }

  // Anchor tag fallback to bypass popup blockers and handle iframe environments
  try {
    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 200);
  } catch (err) {
    console.error('[Navigation] Failed to open new tab via anchor:', err);
    window.location.href = targetUrl;
  }
};
