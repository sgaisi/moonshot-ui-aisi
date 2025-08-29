import TestingHomePage from '@/app/components/testingHomePage';
import { redteamingConfig } from '@/app/config/testingConfigs';

export default function RedteamingHomePage() {
  return (
    <TestingHomePage
      title={redteamingConfig.title}
      menuItems={redteamingConfig.menuItems}
    />
  );
}
