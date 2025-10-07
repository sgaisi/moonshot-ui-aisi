import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import {
  updateAllCookbooks,
  useCookbooks,
} from '@/app/benchmarking/contexts/cookbooksContext';
import { LoadingAnimation } from '@/app/components/loadingAnimation';
import { PopupSurface } from '@/app/components/popupSurface';
import { TabsMenu, TabItem } from '@/app/components/tabsMenu';
import { colors } from '@/app/customColors';
import { useGetCookbooksQuery } from '@/app/services/cookbook-api-service';
import { useAppDispatch, useAppSelector } from '@/lib/redux';
import config from '@/moonshot.config';
import { CookbookSelectionItem } from '@/app/components/cookbookSelectionItem';

const CookbookAbout = dynamic(
  () =>
    import('@/app/components/cookbookAbout').then((mod) => mod.CookbookAbout),
  {
    loading: () => <LoadingAnimation />,
    ssr: true,
  }
);

export type CookbookSelectorMode = 'agentic' | 'benchmark';

export interface CookbookSelectorConfig {
  mode: CookbookSelectorMode;
  tabItems: TabItem<string[]>[];
  categoryDescriptions: Record<string, string>;
  reduxSelector: (state: Record<string, unknown>) => Cookbook[];
  reduxActions: {
    add: (cookbooks: Cookbook[]) => { type: string; payload: Cookbook[] };
    remove: (cookbooks: Cookbook[]) => { type: string; payload: Cookbook[] };
    update: (cookbooks: Cookbook[]) => { type: string; payload: Cookbook[] };
  };
}

interface CookbookSelectorProps extends CookbookSelectorConfig {
  onCookbookSelected: (selectedCookbooks: Cookbook[]) => void;
  onCookbookUnselected: (selectedCookbooks: Cookbook[]) => void;
  onCookbookAboutClick: () => void;
  onCookbookAboutClose: () => void;
}

function CookbookSelector(props: CookbookSelectorProps) {
  const {
    mode,
    tabItems,
    categoryDescriptions,
    reduxSelector,
    reduxActions,
    onCookbookSelected,
    onCookbookUnselected,
    onCookbookAboutClick,
    onCookbookAboutClose,
  } = props;

  const dispatch = useAppDispatch();
  const selectedCookbooks = useAppSelector(reduxSelector);
  const [activeTab, setActiveTab] = useState(tabItems[0]);
  const [cookbookDetails, setCookbookDetails] = useState<
    Cookbook | undefined
  >();

  const [_, setAllCookbooks, isFirstCookbooksFetch, setIsFirstCookbooksFetch] =
    useCookbooks();

  const { data: allCookbooks, isFetching: isFetchingAllCookbooks } =
    useGetCookbooksQuery(
      {
        count: true,
      },
      { skip: !isFirstCookbooksFetch }
    );

  // Build query parameters based on active tab
  const buildQueryParams = () => {
    // Handle agentic tab (uses tags filtering)
    if (activeTab.id === 'agentic') {
      return {
        count: true,
        tags: ['agentic'],
      };
    }

    // Handle all other tabs (uses categories filtering)
    const excludedCategories = activeTab.data
      ? activeTab.data.reduce<string[]>((acc, cat) => {
          if (cat.startsWith('exclude:')) {
            acc.push(cat.split(':')[1]);
          }
          return acc;
        }, [])
      : undefined;
    const selectedCategories =
      activeTab.data && excludedCategories
        ? activeTab.data.filter(
            (cat) =>
              !excludedCategories.includes(cat) && !cat.startsWith('exclude:')
          )
        : activeTab.data;

    return {
      categories:
        selectedCategories && selectedCategories.length > 0
          ? selectedCategories
          : undefined,
      categories_excluded:
        excludedCategories && excludedCategories.length > 0
          ? excludedCategories
          : undefined,
      count: true,
    };
  };

  const queryParams = buildQueryParams();
  const shouldSkipQuery =
    mode === 'benchmark' &&
    activeTab.id !== 'agentic' &&
    (!queryParams.categories || queryParams.categories.length === 0) &&
    (!queryParams.categories_excluded ||
      queryParams.categories_excluded.length === 0);

  const { data: cookbooks = [], isFetching } = useGetCookbooksQuery(
    queryParams,
    { skip: shouldSkipQuery }
  );

  const orderedCookbooks = React.useMemo(() => {
    if (!cookbooks) return [];
    const order = config.cookbooksOrder;
    const ordered = [...cookbooks].sort((a, b) => {
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return ordered;
  }, [cookbooks]);

  useEffect(() => {
    if (isFetchingAllCookbooks) return;
    if (isFirstCookbooksFetch && allCookbooks) {
      updateAllCookbooks(setAllCookbooks, allCookbooks);
      setIsFirstCookbooksFetch(false);
    }
  }, [isFetchingAllCookbooks, allCookbooks]);

  function handleTabClick(tab: TabItem<string[]>) {
    setActiveTab(tab);
  }

  function handleCookbookSelect(cb: Cookbook) {
    if (selectedCookbooks.some((t) => t.id === cb.id)) {
      dispatch(reduxActions.remove([cb]));
      const updatedSelectedCookbooks = selectedCookbooks.filter(
        (c) => c.id !== cb.id
      );
      onCookbookUnselected(updatedSelectedCookbooks);
    } else {
      dispatch(reduxActions.add([cb]));
      const updatedSelectedCookbooks = [...selectedCookbooks, cb];
      onCookbookSelected(updatedSelectedCookbooks);
    }
  }

  function handleAboutClick(cb: Cookbook) {
    setCookbookDetails(cb);
    onCookbookAboutClick();
  }

  function handleCloseAbout() {
    setCookbookDetails(undefined);
    onCookbookAboutClose();
  }

  const categoryDesc = categoryDescriptions[activeTab.id] || '';

  useEffect(() => {
    if (!cookbooks) return;
    const selectedCookbooksWithCounts = cookbooks.filter((cb) =>
      selectedCookbooks.some((scb) => scb.id === cb.id)
    );
    if (selectedCookbooksWithCounts.length) {
      dispatch(reduxActions.update(selectedCookbooksWithCounts));
    }
  }, [cookbooks]);

  return (
    <div className="flex flex-col pt-4 w-full h-full z-[100]">
      {cookbookDetails ? (
        <PopupSurface
          height="100%"
          padding="10px"
          onCloseIconClick={handleCloseAbout}>
          <CookbookAbout
            cookbook={cookbookDetails}
            onSelectChange={handleCookbookSelect}
            checked={selectedCookbooks.some(
              (cb) => cb.id === cookbookDetails.id
            )}
          />
        </PopupSurface>
      ) : (
        <React.Fragment>
          <section className="flex flex-col items-center justify-center gap-5 px-8">
            <h2 className="text-[1.6rem] leading-[2rem] tracking-wide text-white text-center max-w-4xl mx-auto">
              Select the cookbooks you want to run
            </h2>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-6xl mx-auto w-full items-center justify-center">
              <div className="w-full lg:flex-1 max-w-2xl">
                <TabsMenu
                  className="flex justify-center"
                  tabItems={tabItems}
                  barColor={colors.moongray['800']}
                  tabHoverColor={colors.moongray['700']}
                  selectedTabColor={colors.moonpurple}
                  textColor={colors.white}
                  activeTabId={activeTab.id}
                  onTabClick={handleTabClick}
                  layout="responsive"
                  compactMode={false}
                />
              </div>
              {categoryDesc && (
                <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md">
                  <p className="text-white px-4 lg:px-6 py-3 text-[0.9rem] min-h-[65px] bg-gray-800/30 rounded-lg text-center">
                    {categoryDesc}
                  </p>
                </div>
              )}
            </div>
          </section>
          <section
            className="relative flex flex-col mt-8 overflow-y-auto custom-scrollbar"
            style={{ height: 'calc(100% - 155px)' }}>
            <ul className="flex flex-row flex-wrap gap-[2%] w-[100%] px-8 pb-4">
              {isFetching ? (
                <LoadingAnimation />
              ) : cookbooks.length === 0 ? (
                <div className="text-white text-center w-full">
                  No cookbooks found
                </div>
              ) : (
                orderedCookbooks.map((cookbook) => {
                  const selected = selectedCookbooks.some(
                    (t) => t.id === cookbook.id
                  );
                  return (
                    <CookbookSelectionItem
                      key={cookbook.id}
                      cookbook={cookbook}
                      selected={selected}
                      onSelect={handleCookbookSelect}
                      onAboutClick={handleAboutClick}
                    />
                  );
                })
              )}
            </ul>
          </section>
        </React.Fragment>
      )}
    </div>
  );
}

export { CookbookSelector };
