import { useRunMyApplicationHealthCheck } from '@/settings/app-preferences/hooks/useRunMyApplicationHealthCheck';
import { useEffect } from 'react';

type SettingsApplicationPreferencesHealthCheckEffectProps = {
  applicationId: string;
};

export const SettingsApplicationPreferencesHealthCheckEffect = ({
  applicationId,
}: SettingsApplicationPreferencesHealthCheckEffectProps) => {
  const { runMyApplicationHealthCheck } =
    useRunMyApplicationHealthCheck(applicationId);

  useEffect(() => {
    runMyApplicationHealthCheck({ shouldKeepPreviousResult: false });
  }, [runMyApplicationHealthCheck]);

  return null;
};
