import { limitToDocumentIframeMediaPermissions } from '@/media-access/utils/limitToDocumentIframeMediaPermissions';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { GetWorkspaceIframeMediaPermissionsDocument } from '~/generated-metadata/graphql';

export const useWorkspaceIframeMediaPermissions = () => {
  const { data, error } = useQuery(GetWorkspaceIframeMediaPermissionsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  if (isDefined(error)) {
    return [];
  }

  return limitToDocumentIframeMediaPermissions(
    data?.currentWorkspace.iframeMediaPermissions ?? [],
  );
};
