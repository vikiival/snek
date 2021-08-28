import { Call as TCall } from '@polkadot/types/interfaces'
import { EventRecord, Event } from '@polkadot/types/interfaces'

export const matchEvent = (
  event: Event,
  method: string,
  section: string
): boolean => {
  return (
    event.method.toString() === method && event.section.toString() === section
  )
}

export const createTokenId = (collection: string, id: string) => `${collection}-${id}`

export const isTokenClassCreated = ({ event }: EventRecord): boolean =>
  matchEvent(event, 'TokenClassCreated', 'nft')

export const isTokenMinted = ({ event }: EventRecord): boolean =>
  matchEvent(event, 'TokenMinted', 'nft')

export const isTokenBurned = ({ event }: EventRecord): boolean =>
  matchEvent(event, 'TokenBurned', 'nft')

export const isTokenTransferred = ({ event }: EventRecord): boolean =>
  matchEvent(event, 'TokenTransferred', 'nft')

export const isCreateCollection = (call: TCall): boolean =>
  isExtrinsic(call, 'createClass', 'nft')
export const isCreateToken = (call: TCall): boolean =>
  isExtrinsic(call, 'mint', 'nft')

export const isExtrinsic = (
  call: TCall,
  method: string,
  section: string
): boolean => call.section === section && call.method === method
