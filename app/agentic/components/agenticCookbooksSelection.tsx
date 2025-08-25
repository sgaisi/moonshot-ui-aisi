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
import {
  addAgenticCookbooks,
  removeAgenticCookbooks,
  updateAgenticCookbooks,
  useAppDispatch,
  useAppSelector,
} from '@/lib/redux';
import config from '@/moonshot.config';
import { CookbookSelectionItem } from '@/app/benchmarking/components/cookbookSelectionItem';

const descAgentic =
  "Agentic cookbooks test AI models' ability to perform complex, multi-step tasks requiring reasoning, planning, and tool usage in autonomous scenarios.";

const CookbookAbout = dynamic(
  () =>
    import('@/app/benchmarking/components/cookbookAbout').then(
      (mod) => mod.CookbookAbout
    ),
  {
    loading: () => <LoadingAnimation />,
    ssr: true,
  }
);

// Use all available tabs for agentic - more flexible approach
const agenticTabItems: TabItem<string[]>[] = [
  { id: 'agentic', label: 'Agentic Cookbooks', data: [] },
];

type Props = {
  onCookbookSelected: (selectedCookbooks: Cookbook[]) => void;
  onCookbookUnselected: (selectedCookbooks: Cookbook[]) => void;
  onCookbookAboutClick: () => void;
  onCookbookAboutClose: () => void;
};

function AgenticCookbooksSelection(props: Props) {
  const {
    onCookbookSelected,
    onCookbookUnselected,
    onCookbookAboutClick,
    onCookbookAboutClose,
  } = props;
  const dispatch = useAppDispatch();
  const selectedCookbooks = useAppSelector(
    (state) => state.agenticCookbooks.entities
  );
  const [activeTab, setActiveTab] = useState(agenticTabItems[0]);
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

  // Query cookbooks based on selected tab - use API filtering
  const { data: cookbooks = [], isFetching } = useGetCookbooksQuery({
    count: true,
    tags: activeTab.id === 'agentic' ? ['agentic'] : undefined,
  });

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
      dispatch(removeAgenticCookbooks([cb]));
      const updatedSelectedCookbooks = selectedCookbooks.filter(
        (c) => c.id !== cb.id
      );
      onCookbookUnselected(updatedSelectedCookbooks);
    } else {
      dispatch(addAgenticCookbooks([cb]));
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

  const categoryDesc =
    activeTab.id === 'agentic'
      ? 'Agentic cookbooks contain AISI Joint Testing datasets designed specifically for evaluating AI models in autonomous, multi-step reasoning scenarios.'
      : activeTab.id === 'all'
        ? 'All available cookbooks that can be used for agentic testing. Select the cookbooks that best fit your testing requirements.'
        : '';

  useEffect(() => {
    if (!cookbooks) return;
    const selectedCookbooksWithCounts = cookbooks.filter((cb) =>
      selectedCookbooks.some((scb) => scb.id === cb.id)
    );
    if (selectedCookbooksWithCounts.length) {
      dispatch(updateAgenticCookbooks(selectedCookbooksWithCounts));
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
            <h2 className="text-[1.6rem] leading-[2rem] tracking-wide text-white w-full text-center">
              Select the cookbooks you want to run
            </h2>
            <div className="flex flex-row gap-5 w-full">
              <TabsMenu
                className="w-[445px]"
                tabItems={agenticTabItems}
                barColor={colors.moongray['800']}
                tabHoverColor={colors.moongray['700']}
                selectedTabColor={colors.moonpurple}
                textColor={colors.white}
                activeTabId={activeTab.id}
                onTabClick={handleTabClick}
              />
              <p className="flex-1 text-white px-8 text-[0.9rem] min-h-[65px]">
                {categoryDesc}
              </p>
            </div>
          </section>
          <section
            className="relative flex flex-col gap-7 mt-8 h-full"
            style={{ height: 'calc(100% - 155px)' }}>
            <ul className="flex flex-row flex-wrap grow gap-[2%] w-[100%] overflow-y-auto custom-scrollbar px-8">
              {isFetching ? (
                <LoadingAnimation />
              ) : cookbooks.length === 0 ? (
                <div className="text-white text-center w-full">
                  No cookbooks found. Please ensure cookbooks are available in
                  your data directory.
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

export { AgenticCookbooksSelection };
