import { myApplicationHealthCheckFamilyState } from '@/settings/app-preferences/states/myApplicationHealthCheckFamilyState';
import { SettingsApplicationHealthBanner } from '@/settings/applications/components/SettingsApplicationHealthBanner';
import { getApplicationHealthBanner } from '@/settings/applications/utils/getApplicationHealthBanner';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type SettingsApplicationPreferencesHealthBannerProps = {
  applicationId: string;
  fallbackLocation?: string;
};

export const SettingsApplicationPreferencesHealthBanner = ({
  applicationId,
  fallbackLocation,
}: SettingsApplicationPreferencesHealthBannerProps) => {
  const navigate = useNavigate();

  const { result: myApplicationHealthCheckResult } = useAtomFamilyStateValue(
    myApplicationHealthCheckFamilyState,
    applicationId,
  );

  const healthBanner = getApplicationHealthBanner({
    healthCheckResult: myApplicationHealthCheckResult,
    fallbackLocation,
  });

  if (!isDefined(healthBanner)) {
    return null;
  }

  const { action } = healthBanner;

  return (
    <SettingsApplicationHealthBanner
      healthStatus={healthBanner.status}
      title={healthBanner.title}
      description={healthBanner.description}
      action={
        isDefined(action)
          ? { label: action.label, onClick: () => navigate(action.to) }
          : undefined
      }
    />
  );
};
