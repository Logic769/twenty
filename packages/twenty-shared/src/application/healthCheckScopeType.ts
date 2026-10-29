import { type HEALTH_CHECK_SCOPES } from '@/application/constants/HealthCheckScopes';

export type HealthCheckScope = (typeof HEALTH_CHECK_SCOPES)[number];
