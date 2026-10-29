import { normalizeAllowedIframeOrigin } from './normalizeAllowedIframeOrigin';

export const normalizeIframeMediaPermissionOrigin = (
  value: string,
): string | undefined => {
  const origin = normalizeAllowedIframeOrigin(value);

  return origin?.startsWith('https://') ? origin : undefined;
};
