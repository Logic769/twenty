import { myApplicationHealthCheckFamilyState } from '@/settings/app-preferences/states/myApplicationHealthCheckFamilyState';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { RunMyApplicationHealthCheckDocument } from '~/generated-metadata/graphql';

export const useRunMyApplicationHealthCheck = (applicationId: string) => {
  const store = useStore();

  const [runMyApplicationHealthCheckMutation] = useMutation(
    RunMyApplicationHealthCheckDocument,
  );

  const runMyApplicationHealthCheck = useCallback(
    async ({
      shouldKeepPreviousResult,
    }: {
      shouldKeepPreviousResult: boolean;
    }) => {
      const myApplicationHealthCheckAtom =
        myApplicationHealthCheckFamilyState.atomFamily(applicationId);
      const runId = v4();

      store.set(myApplicationHealthCheckAtom, (previousHealthCheck) => ({
        runId,
        result: shouldKeepPreviousResult ? previousHealthCheck.result : null,
      }));

      const response = await runMyApplicationHealthCheckMutation({
        variables: { applicationId },
      }).catch(() => undefined);

      if (
        !isDefined(response) ||
        store.get(myApplicationHealthCheckAtom).runId !== runId
      ) {
        return;
      }

      store.set(myApplicationHealthCheckAtom, {
        runId,
        result: response.data?.runMyApplicationHealthCheck ?? null,
      });
    },
    [applicationId, runMyApplicationHealthCheckMutation, store],
  );

  return { runMyApplicationHealthCheck };
};
