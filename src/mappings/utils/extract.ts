import { Call as TCall } from "@polkadot/types/interfaces";
import { EventRecord, Event } from '@polkadot/types/interfaces';
import { SubstrateExtrinsic } from "@subql/types";
import { Codec } from '@polkadot/types/types';
import { BasicExtrinsicData, CollectionData } from './types';

export const log = (title: string, arg: any) => logger.info(`[${title}] ${JSON.stringify(arg, null, 2)}` )

export const getEvents = (records: EventRecord[], cb: (record: EventRecord) => boolean): string[] => {
  const eventRecord = records.find(cb);
  if (eventRecord) {
    return getArgs(eventRecord.event.data);
  }

  return []
}

const getCollectionEvents = (records: EventRecord[]): string | undefined => {
  return getEvents(records, isTokenClassCreated)[1];
}

const isTokenClassCreated = ({ event }:EventRecord): boolean => matchEvent(event, 'TokenClassCreated', 'nft');

export const matchEvent = (event: Event, method: string, section: string): boolean => {
  return event.method.toString() === method && event.section.toString() === section;
}

export const isCreateCollection = (call: TCall): boolean => isExtrinsic(call, "createClass", "nft");
export const isCreateToken = (call: TCall): boolean => isExtrinsic(call, "mint", "nft");

export const isExtrinsic = (call: TCall, method: string, section: string): boolean => call.section === section && call.method === method

export const getArgs = (args: Codec[]): string[] => {
  // logger.info(`getArgs ${args.toString()}`)
  return args.map(arg => arg.toHuman().toString());
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


export const processToken = (extrinsic: SubstrateExtrinsic): CollectionData => {
  if (!isCreateToken(extrinsic.extrinsic.method as TCall)) {
    logger.error(`[TOKEN] ${extrinsic.extrinsic.method.toString()} is not a create NFT`);
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