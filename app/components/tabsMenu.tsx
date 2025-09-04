import { useState } from 'react';

type TabItem<T> = {
  id: string;
  label: string;
  data?: T;
};

type TabsMenuProps = {
  tabItems: TabItem<string[]>[];
  activeTabId: string;
  barColor: string;
  textColor: string;
  tabHoverColor: string;
  selectedTabColor: string;
  className?: string;
  onTabClick: (tab: TabItem<string[]>) => void;
  layout?: 'horizontal' | 'vertical' | 'responsive';
  compactMode?: boolean;
};

function TabsMenu(props: TabsMenuProps) {
  const {
    tabItems,
    barColor,
    activeTabId,
    selectedTabColor,
    tabHoverColor,
    textColor,
    className = '',
    onTabClick,
    layout = 'responsive',
    compactMode = false,
  } = props;
  const [hoveredTabId, setHoveredTabId] = useState<string | undefined>();

  // Responsive layout classes based on layout prop
  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex-col items-start gap-2 w-full p-4';
      case 'horizontal':
        return 'flex-row items-center justify-start gap-2 sm:gap-3 lg:gap-5 py-2 px-4 overflow-x-auto scrollbar-hide';
      case 'responsive':
      default:
        return `
          flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-center 
          gap-2 sm:gap-3 lg:gap-5 py-2 px-4 w-full
          sm:overflow-x-auto sm:scrollbar-hide
          ${compactMode ? 'sm:py-1 sm:px-3' : ''}
        `;
    }
  };

  // Tab item classes for responsive behavior
  const getTabItemClasses = (isActive: boolean, isHovered: boolean) => {
    const baseClasses = `
      rounded px-3 py-2 transition-all duration-300 cursor-pointer
      flex-shrink-0 text-center whitespace-nowrap
      ${compactMode ? 'px-2 py-1 text-sm' : ''}
      ${layout === 'vertical' ? 'w-full text-left' : ''}
      hover:scale-105 active:scale-95
    `;

    return baseClasses.trim();
  };

  return (
    <div className="w-full">
      <ul
        className={`
          flex ${getLayoutClasses()} h-auto min-h-[48px] rounded-lg
          ${className}
        `
          .replace(/\s+/g, ' ')
          .trim()}
        style={{
          backgroundColor: barColor,
        }}>
        {tabItems.map((tab, index) => {
          const isActive = activeTabId === tab.id;
          const isHovered = hoveredTabId === tab.id;
          let tabColor = '';
          if (isActive) {
            tabColor = selectedTabColor || '';
          } else if (isHovered) {
            tabColor = tabHoverColor;
          }

          return (
            <li
              key={tab.id}
              className={getTabItemClasses(isActive, isHovered)}
              onMouseEnter={() => setHoveredTabId(tab.id)}
              onMouseLeave={() => setHoveredTabId(undefined)}
              style={{
                color: textColor,
                backgroundColor: tabColor,
              }}
              title={tab.label} // Tooltip for truncated text
            >
              <button
                onClick={() => onTabClick(tab)}
                className="w-full text-inherit bg-transparent border-none outline-none cursor-inherit"
                aria-label={`Switch to ${tab.label} tab`}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}>
                <span className="block truncate max-w-[120px] sm:max-w-[150px] lg:max-w-none">
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Optional scroll indicators for horizontal scroll */}
      {layout !== 'vertical' && tabItems.length > 3 && (
        <style jsx>{`
          /* Hide scrollbar for cleaner look */
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      )}
    </div>
  );
}

export { TabsMenu };
export type { TabItem };
