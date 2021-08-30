import { SubstrateExtrinsic } from "@subql/types";
import { CollectionEntity, NFTEntity } from "../types";
import { processCollection, log, processToken, processTransfer, processBurn } from './utils/extract';
import { createTokenId, exists } from './utils/helpers';

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

export async function handleTransfer(extrinsic: SubstrateExtrinsic): Promise<void> {
    const interaction = processTransfer(extrinsic)
    log('TRANSFER', interaction)
    if (!interaction.id) {
        logger.warn("No collection ID found in extrinsic");
        return;
    }

    const final = await NFTEntity.get(interaction.id);
    
    if (!exists(final)) {
        logger.console.error(`Token ${interaction.id} does not exist`);
        return;
    }

    final.currentOwner = interaction.value;
    
    logger.info(`SAVED [TRASFER] ${final.id}`)
    await final.save();
}


export async function handleBurn(extrinsic: SubstrateExtrinsic): Promise<void> {
    const interaction = processBurn(extrinsic)
    log('BURN', interaction)
    if (!interaction.id) {
        logger.warn("No collection ID found in extrinsic");
        return;
    }

    const final = await NFTEntity.get(interaction.id);
    
    if (!exists(final)) {
        logger.console.error(`Token ${interaction.id} does not exist`);
        return;
    }

    final.burned = true;
    
    logger.info(`SAVED [BURN] ${final.id}`)
    await final.save();
}



