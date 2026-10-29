import { isArray, isObject, isString } from '@sniptt/guards';
import { type IframeMediaPermission } from 'twenty-shared/types';
import {
  isDefined,
  normalizeIframeMediaPermissionOrigin,
} from 'twenty-shared/utils';

export const toIframeMediaPermissions = (
  permissions: unknown,
): IframeMediaPermission[] => {
  if (!isArray(permissions)) {
    return [];
  }

  const permissionsByOrigin = new Map<string, IframeMediaPermission>();

  for (const permission of permissions) {
    if (
      !isObject(permission) ||
      !('origin' in permission) ||
      !isString(permission.origin)
    ) {
      continue;
    }

    const origin = normalizeIframeMediaPermissionOrigin(permission.origin);
    const microphone =
      'microphone' in permission && permission.microphone === true;
    const camera = 'camera' in permission && permission.camera === true;

    if (!isDefined(origin) || (!microphone && !camera)) {
      continue;
    }

    const existingPermission = permissionsByOrigin.get(origin);

    permissionsByOrigin.set(origin, {
      origin,
      microphone: microphone || existingPermission?.microphone === true,
      camera: camera || existingPermission?.camera === true,
    });
  }

  return [...permissionsByOrigin.values()];
};
