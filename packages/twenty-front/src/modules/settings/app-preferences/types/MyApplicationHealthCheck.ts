import { type ApplicationHealthCheckResultFieldsFragment } from '~/generated-metadata/graphql';

export type MyApplicationHealthCheck = {
  runId: string | null;
  result: ApplicationHealthCheckResultFieldsFragment | null;
};
