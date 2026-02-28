/**
 * Utility functions for handling wallet/extension errors.
 *
 * The "Extension context invalidated" error occurs when a browser wallet
 * extension (e.g. MetaMask) reloads, the background service worker shuts down,
 * or the extension is disabled/uninstalled while an async wallet operation is
 * still in progress.
 */

/**
 * Checks whether an error was caused by the browser extension context being
 * invalidated (e.g. wallet extension reloaded or disabled mid-request).
 */
export function isExtensionContextInvalidated(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Extension context invalidated');
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message).includes(
      'Extension context invalidated'
    );
  }
  return false;
}

/**
 * Handles an extension-context-invalidated error by reloading the page so the
 * wallet provider is re-injected. If the error is *not* an extension context
 * error the function returns `false` and the caller should handle it normally.
 *
 * @returns `true` if the error was handled (page will reload), `false` otherwise.
 */
export function handleExtensionContextError(error: unknown): boolean {
  if (isExtensionContextInvalidated(error)) {
    console.warn(
      'Wallet extension context was invalidated. Reloading the page to restore the connection…'
    );
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return true;
  }
  return false;
}
