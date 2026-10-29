import { type MyApplicationHealthCheck } from '@/settings/app-preferences/types/MyApplicationHealthCheck';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const myApplicationHealthCheckFamilyState = createAtomFamilyState<
  MyApplicationHealthCheck,
  string
>({
  key: 'myApplicationHealthCheckFamilyState',
  defaultValue: { runId: null, result: null },
});
