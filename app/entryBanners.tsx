'use client';
import Link from 'next/link';
import React from 'react';
import { Icon, IconName } from '@/app/components/IconSVG';
import { ActionCard } from '@/app/components/actionCard/actionCard';
import { Banner } from '@/app/components/banner/banner';
import { Modal } from '@/app/components/modal';
import { colors } from '@/app/customColors';
import { useIsResponsiveBreakpoint } from '@/app/hooks/useIsResponsiveBreakpoint';
import { useOrientation } from '@/app/hooks/useOrientation';
import {
  resetBenchmarkCookbooks,
  resetBenchmarkModels,
  useAppDispatch,
} from '@/lib/redux';

function EntryBanners() {
  const dispatch = useAppDispatch();
  const screenSize = useIsResponsiveBreakpoint();
  const orientation = useOrientation();
  function handleStartNewRunClick() {
    dispatch(resetBenchmarkCookbooks());
    dispatch(resetBenchmarkModels());
  }
  return (
    <>
      {orientation === 'portrait' && (
        <Modal
          heading="Change Orientation"
          bgColor={colors.moongray['800']}
          textColor="#FFFFFF"
          primaryBtnLabel="Ok"
          enableScreenOverlay
          hideCloseIcon>
          <div className="flex gap-2 items-start">
            <Icon
              name={IconName.Alert}
              size={30}
              color={colors.moongray[400]}
              style={{ marginTop: '8px' }}
            />
            <p className="text-[1.1rem] pt-3">
              Change to landscape mode for better user experience.
            </p>
          </div>
        </Modal>
      )}
      <div className="grid grid-cols-1 grid-rows-[1rem, 1fr] gap-6">
        {/* Hero Banner Section with Enhanced Visual Depth */}
        <section className="mb-[2%]">
          <div className="relative">
            {/* Background Shadow Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-moonwine-800/20 to-moonwine-700/20 rounded-lg blur-xl" />
            {/* Main Banner with Glass Effect */}
            <div className="relative bg-gradient-to-r from-moongray-800/90 to-moongray-700/90 backdrop-blur-sm border border-moonwine-600/30 rounded-lg shadow-2xl">
              <Banner
                bannerColor="transparent"
                textColor={colors.white}
                buttonColor={colors.imdalight[980]}
                buttonHoverColor={colors.imdalight[900]}
                buttonTextColor={colors.white}
                bannerText={
                  <span>
                    Focus on what&apos;s important, <br /> Run only the best and
                    most relevant tests.
                  </span>
                }
                buttonText="Get Started"
                onBtnClick={handleStartNewRunClick}>
                <div style={{ paddingLeft: '0.5rem' }}>
                  <Icon
                    name={IconName.Asterisk}
                    size={screenSize === 'sm' || screenSize === 'md' ? 45 : 50}
                    color={colors.imdalight[400]}
                  />
                </div>
              </Banner>
            </div>
          </div>
        </section>

        {/* Action Cards Section with Enhanced Separation */}
        <section>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 grid grid-cols-3 gap-6">
              <Link
                href="/redteaming/sessions/new"
                onClick={handleStartNewRunClick}
                className="group transform transition-all duration-300 hover:scale-105">
                <div className="relative">
                  {/* Card Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative">
                    <ActionCard
                      title="Discover"
                      description="new vulnerabilities"
                      descriptionColor={colors.moongray[300]}
                      cardColor={colors.moongray[900]}
                      iconName={IconName.Spacesuit}
                      iconColor={colors.imdalight[400]}
                      actionText="Start Red Teaming"
                    />
                  </div>
                </div>
              </Link>

              <Link
                href="/benchmarking/session/new"
                onClick={handleStartNewRunClick}
                className="group transform transition-all duration-300 hover:scale-105">
                <div className="relative">
                  {/* Card Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative">
                    <ActionCard
                      title="Evaluate"
                      description="against standard tests"
                      descriptionColor={colors.moongray[300]}
                      cardColor={colors.moongray[900]}
                      iconName={IconName.CheckList}
                      iconColor={colors.imdalight[400]}
                      actionText="Run Benchmarks"
                    />
                  </div>
                </div>
              </Link>

              <Link
                href="/benchmarking/cookbooks/new"
                className="group transform transition-all duration-300 hover:scale-105">
                <div className="relative">
                  {/* Card Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative">
                    <ActionCard
                      title="Create"
                      description="cookbooks"
                      descriptionColor={colors.moongray[300]}
                      cardColor={colors.moongray[900]}
                      iconName={IconName.Book}
                      iconColor={colors.imdalight[400]}
                      actionText="Select Recipes"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export { EntryBanners };
