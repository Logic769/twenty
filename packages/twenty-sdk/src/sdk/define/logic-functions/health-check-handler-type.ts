import type { ApplicationHealthCheckResult } from 'twenty-shared/application';
import type { LogicFunctionExecutionContext } from 'twenty-shared/logic-function';

export type HealthCheckHandler = (
  payload: Record<string, never>,
  context: LogicFunctionExecutionContext,
) => ApplicationHealthCheckResult | Promise<ApplicationHealthCheckResult>;
