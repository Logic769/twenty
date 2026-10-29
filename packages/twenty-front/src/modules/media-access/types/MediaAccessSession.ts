export type MediaAccessSession = {
  id: string;
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'capturing' | 'delegated';
  mediaTypes: ('audio' | 'video')[];
  origin?: string;
  onStop: () => void;
};
