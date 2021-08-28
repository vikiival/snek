export interface BasicExtrinsicData {
  caller: string;
  blockNumber: string;
  timestamp: Date;
}

export interface Collection extends BasicExtrinsicData {
  metadata: string;
  id: string;
}

export interface Token extends Collection {
  metadata: string;
  id: string;
  collectionId: string;
}