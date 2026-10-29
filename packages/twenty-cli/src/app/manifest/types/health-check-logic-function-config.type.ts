import { type HealthCheckScope } from 'twenty-shared/application';

import type { LogicFunctionConfig } from '@/app/manifest/types/logic-function-config.type';

export type HealthCheckLogicFunctionConfig = LogicFunctionConfig & {
  scope?: HealthCheckScope;
};
