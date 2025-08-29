'use client';
import Link from 'next/link';
import { IconName } from '@/app/components/IconSVG';
import BackToHomeButton from '@/app/components/backToHomeButton';
import { SubmenuButton } from '@/app/components/submenuButton/submenuButton';
import { colors } from '@/app/customColors';

export interface MenuItem {
  href: string;
  text: string;
  iconName: IconName;
  width?: string;
  onClick?: () => void;
}

export interface TestingHomePageProps {
  title: string;
  menuItems: MenuItem[];
  onStartNewRunClick?: () => void;
}

export default function TestingHomePage({
  title,
  menuItems,
  onStartNewRunClick,
}: TestingHomePageProps) {
  return (
    <>
      <header className="relative h-[50px]">
        <Link
          href="/"
          style={{ position: 'absolute', top: 10, left: 15 }}>
          <BackToHomeButton colors={colors} />
        </Link>
      </header>
      <section className="flex flex-col items-center gap-2.5">
        <h3 className="text-moonpurplelight tracking-widest text-[1.4rem]">
          {title}
        </h3>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            style={{ width: item.width || '40%' }}
            onClick={item.onClick || onStartNewRunClick}>
            <SubmenuButton
              width="100%"
              text={item.text}
              menuIconName={item.iconName}
              textColor={colors.white}
            />
          </Link>
        ))}
      </section>
    </>
  );
}
