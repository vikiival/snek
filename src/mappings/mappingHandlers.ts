import { SubstrateExtrinsic } from "@subql/types";
import { CollectionEntity } from "../types";
import { processCollection, log } from './utils/extract';

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
    

    logger.info(`SAVED [COLLECTION] ${final.id}`)
    await final.save();
}


