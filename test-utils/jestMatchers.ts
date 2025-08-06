// Helper function to normalize className whitespace for consistent snapshots
const normalizeClassNames = (element: Element): Element => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);

  let node: Element | null = walker.currentNode as Element;
  while (node) {
    const classAttr = node.getAttribute('class');
    if (classAttr) {
      // Normalize multiple whitespace characters to single spaces and trim
      const normalizedClass = classAttr.replace(/\s+/g, ' ').trim();
      node.setAttribute('class', normalizedClass);
    }
    node = walker.nextNode() as Element;
  }

  return element;
};

/**
 * Utility function to normalize className whitespace and match snapshot
 * Use this for snapshot tests that may have inconsistent className formatting
 *
 * @param container - The DOM container to snapshot
 * @example
 * expectNormalizedSnapshot(container);
 */
export const expectNormalizedSnapshot = (container: any): void => {
  // Check if it's a DOM element/container and normalize if needed
  if (container && typeof container === 'object' && container.nodeType) {
    const normalizedElement = normalizeClassNames(
      container.cloneNode(true) as Element
    );
    expect(normalizedElement).toMatchSnapshot();
  } else {
    // For non-DOM elements, use regular snapshot
    expect(container).toMatchSnapshot();
  }
};
