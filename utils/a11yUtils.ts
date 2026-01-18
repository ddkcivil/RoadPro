/**
 * Accessibility utilities for improving ARIA compliance and keyboard navigation
 */

/**
 * Focus trap for modal dialogs and similar components
 */
export function createFocusTrap(element: HTMLElement): { activate: () => void; deactivate: () => void } {
  let active = false;
  let previouslyFocusedElement: HTMLElement | null = null;

  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    const focusable = element.querySelectorAll<HTMLElement>(focusableElements);
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
      lastFocusable.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      firstFocusable.focus();
      e.preventDefault();
    }
  };

  const activate = () => {
    if (active) return;
    
    active = true;
    previouslyFocusedElement = document.activeElement as HTMLElement;
    const focusable = element.querySelectorAll<HTMLElement>(focusableElements);
    const firstFocusable = focusable[0];
    
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    element.addEventListener('keydown', handleKeyDown);
  };

  const deactivate = () => {
    if (!active) return;
    
    active = false;
    element.removeEventListener('keydown', handleKeyDown);
    
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  };

  return { activate, deactivate };
}

/**
 * Generate unique IDs for accessibility labels
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Announce content to screen readers
 */
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  // Create or reuse the live region element
  let liveRegion = document.getElementById('a11y-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('id', 'a11y-live-region');
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    
    document.body.appendChild(liveRegion);
  }
  
  // Clear and update the content
  liveRegion.textContent = '';
  // Force reflow to ensure the announcement is read
  liveRegion.textContent = message;
}

/**
 * Focus management helper
 */
export function focusElement(element: HTMLElement | null): void {
  if (element && element.focus) {
    element.focus();
  }
}

/**
 * Check if an element is in the tab order
 */
export function isTabbable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  if (element.hasAttribute('disabled') && element.getAttribute('disabled') !== null) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  
  return true;
}

/**
 * Get all focusable children within an element
 */
export function getFocusableChildren(element: HTMLElement): HTMLElement[] {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(element.querySelectorAll<HTMLElement>(focusableElements));
}

/**
 * Scroll to element with smooth behavior and focus
 */
export function scrollToElement(selector: string, focus = true): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (focus) {
      element.focus({ preventScroll: true });
    }
  }
}

/**
 * Generate ARIA attributes for toggle components
 */
export function getToggleAriaProps(isExpanded: boolean, controlId?: string) {
  return {
    'aria-expanded': isExpanded,
    'aria-controls': controlId,
  };
}

/**
 * Generate ARIA attributes for tabs
 */
export function getTabAriaProps(
  isActive: boolean,
  panelId: string,
  tabId?: string
) {
  return {
    role: 'tab',
    'aria-selected': isActive,
    'aria-controls': panelId,
    id: tabId,
    tabIndex: isActive ? 0 : -1,
  };
}

/**
 * Generate ARIA attributes for tab panels
 */
export function getTabPanelAriaProps(
  isActive: boolean,
  tabId: string,
  panelId?: string
) {
  return {
    role: 'tabpanel',
    'aria-labelledby': tabId,
    id: panelId,
    hidden: !isActive,
  };
}

/**
 * Add skip link for keyboard navigation
 */
export function addSkipLink(targetSelector: string, text: string = 'Skip to main content'): void {
  // Check if skip link already exists
  if (document.getElementById('skip-link')) return;
  
  const skipLink = document.createElement('a');
  skipLink.href = targetSelector;
  skipLink.id = 'skip-link';
  skipLink.textContent = text;
  skipLink.style.position = 'absolute';
  skipLink.style.left = '-10000px';
  skipLink.style.top = 'auto';
  skipLink.style.width = '1px';
  skipLink.style.height = '1px';
  skipLink.style.overflow = 'hidden';
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.left = '10px';
    skipLink.style.top = '10px';
    skipLink.style.width = 'auto';
    skipLink.style.height = 'auto';
    skipLink.style.overflow = 'visible';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.left = '-10000px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);
}