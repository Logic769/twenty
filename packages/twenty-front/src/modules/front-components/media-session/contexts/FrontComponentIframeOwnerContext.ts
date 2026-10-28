import { type MediaAccessOwner } from '@/media-access/types/MediaAccessOwner';
import { createRequiredContext } from '~/utils/createRequiredContext';

export const [
  FrontComponentIframeOwnerProvider,
  useFrontComponentIframeOwnerOrThrow,
] = createRequiredContext<Extract<MediaAccessOwner, { type: 'application' }>>(
  'FrontComponentIframeOwner',
);
