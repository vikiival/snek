import { Call as TCall } from "@polkadot/types/interfaces";
import { EventRecord, Event } from '@polkadot/types/interfaces';
import { SubstrateExtrinsic } from "@subql/types";
import { Codec } from '@polkadot/types/types';
import { BasicExtrinsicData, Collection, Token } from './types';
import { isCreateCollection, isCreateToken, isTokenClassCreated, isTokenMinted } from './helpers';

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

const getTokenEvents = (records: EventRecord[]): string[] => {
  return getEvents(records, isTokenMinted);
}


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

export const processCollection = (extrinsic: SubstrateExtrinsic): Collection => {
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


export const processToken = (extrinsic: SubstrateExtrinsic): Token => {
  if (!isCreateToken(extrinsic.extrinsic.method as TCall)) {
    logger.error(`[TOKEN] ${extrinsic.extrinsic.method.toString()} is not a create NFT`);
    return;
  }

  const data = getBasicData(extrinsic);
  const args = getArgs(extrinsic.extrinsic.args);
  const events = getTokenEvents(extrinsic.events);

  return {
    ...data,
    id: events[2],
    metadata: args[1],
    collectionId: args[0],
  }

}