import { gql } from '@apollo/client';

export const GET_WORKSPACE_IFRAME_MEDIA_PERMISSIONS = gql`
  query GetWorkspaceIframeMediaPermissions {
    currentWorkspace {
      id
      iframeMediaPermissions {
        origin
        microphone
        camera
      }
    }
  }
`;
