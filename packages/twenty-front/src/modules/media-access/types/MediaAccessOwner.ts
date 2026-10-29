import { type RequestMediaCapabilityApproval } from '@/media-access/types/RequestMediaCapabilityApproval';

export type MediaAccessOwner =
  | { type: 'workspace-widget'; id: string; name: string }
  | {
      type: 'application';
      id: string;
      name: string;
      grantedCapabilities: readonly string[];
      requestCapabilityApproval: RequestMediaCapabilityApproval;
    };
