export interface BasicExtrinsicData {
  caller: string;
  blockNumber: string;
  timestamp: Date;
}

export interface CollectionData extends BasicExtrinsicData {
  metadata: string;
  id: string;
}