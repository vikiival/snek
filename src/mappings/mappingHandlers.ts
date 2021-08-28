import { SubstrateExtrinsic } from "@subql/types";
import { CollectionEntity, NFTEntity } from "../types";
import { processCollection, log, processToken } from './utils/extract';
import { createTokenId } from './utils/helpers';

export async function handleCreateCollection(extrinsic: SubstrateExtrinsic): Promise<void> {
    const collection = processCollection(extrinsic)
    log('CREATE', collection)
    if (!collection.id) {
        logger.warn("No collection ID found in extrinsic");
        return;
    }

    const final = CollectionEntity.create(collection);
    final.issuer = collection.caller;
    final.currentOwner = collection.caller;
    final.burned = false;
    

    logger.info(`SAVED [COLLECTION] ${final.id}`)
    await final.save();
}

export async function handleCreateToken(extrinsic: SubstrateExtrinsic): Promise<void> {
    const token = processToken(extrinsic)
    log('MINT', token)
    if (!token.id) {
        logger.warn("No collection ID found in extrinsic");
        return;
    }

    const final = NFTEntity.create(token);
    final.issuer = token.caller;
    final.currentOwner = token.caller;
    final.id = createTokenId(token.collectionId, token.id);
    final.burned = false;
    

    logger.info(`SAVED [TOKEN] ${final.id}`)
    await final.save();
}



