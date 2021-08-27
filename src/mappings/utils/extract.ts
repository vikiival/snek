import { Call as TCall } from "@polkadot/types/interfaces";
import { EventRecord } from '@polkadot/types/interfaces';
import { SubstrateExtrinsic } from "@subql/types";
import { Codec } from '@polkadot/types/types';
import { BasicExtrinsicData, CollectionData } from './types';

export const getCollectionEvents = (records: EventRecord[]): string | undefined => {
  const eventRecord = records.find(record => record.event.method.toString() === "TokenClassCreated");
  logger.info('parsing event', eventRecord.toString())
  if (eventRecord) {
    const topics = eventRecord.topics.map(topic => topic.toString());
    return topics[1];
  }
}

export const isCreateCollection = (call: TCall): boolean => call.section === "nft" && call.method === "createClass"

export const getArgs = (args: Codec[]): string[] => {
  logger.info('getArgs', args.toString())
  return args.map(String);
}

export const getBasicData = (extrinsic: SubstrateExtrinsic): BasicExtrinsicData => {
  if (!extrinsic.success) {
    return {} as BasicExtrinsicData;
  }

  const signer = extrinsic.extrinsic.signer.toString();
  const blockNumber = extrinsic.block.block.header.number.toString()
  const timestamp = extrinsic.block.timestamp;

  return {
    caller: signer,
    blockNumber,
    timestamp,
  }
}

export const processCollection = (extrinsic: SubstrateExtrinsic): CollectionData => {
  if (!isCreateCollection(extrinsic.extrinsic.method as TCall)) {
    logger.error(`[COLLECTION] ${extrinsic.extrinsic.method.toString()} is not a create collection`);
    return;
  }

  const data = getBasicData(extrinsic);
  const args = getArgs(extrinsic.extrinsic.args);
  const id = getCollectionEvents(extrinsic.events);

  return {
    ...data,
    id,
    metadata: args[0],
  }

}