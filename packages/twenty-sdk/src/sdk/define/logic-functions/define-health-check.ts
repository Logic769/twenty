import { HEALTH_CHECK_SCOPES } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type HealthCheckLogicFunctionConfig } from '@/sdk/define/logic-functions/health-check-logic-function-config';

export const defineHealthCheck: DefineEntity<HealthCheckLogicFunctionConfig> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Health check must have a universalIdentifier');
  }

  if (!config.handler) {
    errors.push('Health check must have a handler');
  } else if (typeof config.handler !== 'function') {
    errors.push('Health check handler must be a function');
  }

  if (isDefined(config.scope) && !HEALTH_CHECK_SCOPES.includes(config.scope)) {
    errors.push(
      `Health check scope must be one of ${HEALTH_CHECK_SCOPES.join(', ')}`,
    );
  }

  return createValidationResult({
    config,
    errors,
  });
};
