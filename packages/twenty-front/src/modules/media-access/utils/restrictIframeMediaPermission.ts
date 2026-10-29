import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const restrictIframeMediaPermission = ({
  permission,
  capabilities,
}: {
  permission: IframeMediaPermission | null;
  capabilities: readonly string[];
}): IframeMediaPermission | null => {
  if (!isDefined(permission)) {
    return null;
  }

  const microphone =
    permission.microphone && capabilities.includes('microphone');
  const camera = permission.camera && capabilities.includes('camera');

  if (!microphone && !camera) {
    return null;
  }

  return { origin: permission.origin, microphone, camera };
};
