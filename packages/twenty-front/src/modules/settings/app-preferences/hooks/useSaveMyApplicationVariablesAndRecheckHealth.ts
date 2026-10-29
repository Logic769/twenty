import { useRunMyApplicationHealthCheck } from '@/settings/app-preferences/hooks/useRunMyApplicationHealthCheck';

export const useSaveMyApplicationVariablesAndRecheckHealth = ({
  applicationId,
  hasUserHealthCheck,
  hasMissingRequiredVariables,
  saveApplicationVariables,
}: {
  applicationId: string;
  hasUserHealthCheck: boolean;
  hasMissingRequiredVariables: boolean;
  saveApplicationVariables: () => Promise<boolean>;
}) => {
  const { runMyApplicationHealthCheck } =
    useRunMyApplicationHealthCheck(applicationId);

  const saveApplicationVariablesAndRecheckHealth = async () => {
    const areApplicationVariablesSaved = await saveApplicationVariables();

    if (
      !areApplicationVariablesSaved ||
      !hasUserHealthCheck ||
      hasMissingRequiredVariables
    ) {
      return;
    }

    await runMyApplicationHealthCheck({ shouldKeepPreviousResult: true });
  };

  return { saveApplicationVariablesAndRecheckHealth };
};
