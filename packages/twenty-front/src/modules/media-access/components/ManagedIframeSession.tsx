import { ManagedIframeEnableButton } from '@/media-access/components/ManagedIframeEnableButton';
import { ManagedIframeMediaAccessSessionEffect } from '@/media-access/components/ManagedIframeMediaAccessSessionEffect';
import { type ManagedIframeElementProps } from '@/media-access/types/ManagedIframeElementProps';
import { type RequestMediaCapabilityApproval } from '@/media-access/types/RequestMediaCapabilityApproval';
import { getIframeMediaPermissionMediaTypes } from '@/media-access/utils/getIframeMediaPermissionMediaTypes';
import { isIframeMediaPermissionCovered } from '@/media-access/utils/isIframeMediaPermissionCovered';
import { restrictIframeMediaPermission } from '@/media-access/utils/restrictIframeMediaPermission';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment, useCallback, useId, useState } from 'react';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { getIframeMediaAllow, isDefined } from 'twenty-shared/utils';

type ManagedIframeSessionProps = ManagedIframeElementProps & {
  ownerId: string;
  ownerName: string;
  permission: IframeMediaPermission | null;
  grantedPermission: IframeMediaPermission | null;
  requestCapabilityApproval?: RequestMediaCapabilityApproval;
};

const getEnableLabel = (permission: IframeMediaPermission) => {
  if (permission.microphone && permission.camera) {
    return t`Enable microphone and camera`;
  }

  if (permission.camera) {
    return t`Enable camera`;
  }

  return t`Enable microphone`;
};

export const ManagedIframeSession = ({
  src,
  srcDoc,
  title,
  className,
  style,
  width,
  height,
  hidden,
  onLoad,
  onError,
  sandbox,
  allow,
  allowFullScreen,
  renderIframe,
  iframeElement,
  ownerId,
  ownerName,
  permission,
  grantedPermission,
  requestCapabilityApproval,
}: ManagedIframeSessionProps) => {
  const mediaAccessSessionId = useId();
  const [nativeIframeElement, setNativeIframeElement] =
    useState<HTMLIFrameElement | null>(null);
  const [activatedPermission, setActivatedPermission] =
    useState<IframeMediaPermission | null>(null);
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);
  const delegatedPermission =
    isDefined(activatedPermission) &&
    isIframeMediaPermissionCovered({
      permission: activatedPermission,
      coveringPermission: permission,
    })
      ? activatedPermission
      : null;
  const isActivated = isDefined(delegatedPermission);

  if (isDefined(activatedPermission) && !isActivated) {
    setActivatedPermission(null);
  }

  const anchorElement = iframeElement ?? nativeIframeElement;
  const handleDeactivate = useCallback(() => {
    setActivatedPermission(null);
  }, []);
  const handleEnable = async () => {
    if (!isDefined(permission)) {
      return;
    }

    if (
      !isDefined(requestCapabilityApproval) ||
      isIframeMediaPermissionCovered({
        permission,
        coveringPermission: grantedPermission,
      })
    ) {
      setActivatedPermission(permission);
      return;
    }

    setIsRequestingApproval(true);

    try {
      const approvedCapabilities = await requestCapabilityApproval({
        mediaTypes: getIframeMediaPermissionMediaTypes(permission),
        abortSignal: new AbortController().signal,
      });

      setActivatedPermission(
        restrictIframeMediaPermission({
          permission,
          capabilities: approvedCapabilities,
        }),
      );
    } finally {
      setIsRequestingApproval(false);
    }
  };
  const iframeAllow = getIframeMediaAllow({
    allow,
    permission: delegatedPermission,
  });
  const iframeSandbox = isActivated
    ? [
        ...new Set([
          ...(sandbox ?? '').split(/\s+/).filter(isNonEmptyString),
          'allow-same-origin',
        ]),
      ].join(' ')
    : sandbox;

  return (
    <>
      {isDefined(delegatedPermission) && (
        <ManagedIframeMediaAccessSessionEffect
          id={mediaAccessSessionId}
          ownerId={ownerId}
          ownerName={ownerName}
          permission={delegatedPermission}
          onStop={handleDeactivate}
        />
      )}
      <Fragment key={isActivated ? 'media-enabled' : 'media-disabled'}>
        {isDefined(renderIframe) ? (
          renderIframe({ allow: iframeAllow, sandbox: iframeSandbox })
        ) : (
          <iframe
            ref={setNativeIframeElement}
            src={src}
            srcDoc={srcDoc}
            title={title}
            className={className}
            style={style}
            width={width}
            height={height}
            hidden={hidden}
            onLoad={onLoad}
            onError={onError}
            sandbox={iframeSandbox}
            allow={iframeAllow}
            allowFullScreen={allowFullScreen}
          />
        )}
      </Fragment>
      {isDefined(permission) &&
        !isActivated &&
        !hidden &&
        isDefined(anchorElement) && (
          <ManagedIframeEnableButton
            anchorElement={anchorElement}
            label={getEnableLabel(permission)}
            disabled={isRequestingApproval}
            onClick={() => void handleEnable()}
          />
        )}
    </>
  );
};
