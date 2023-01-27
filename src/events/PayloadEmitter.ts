import EventEmitter from 'events'

export interface PayloadChangeEvent {
  collection?: string
  global?: string
  id?: string
}

export enum PayloadEmittertType {
  INVALIDATE = 'INVALIDATE'
}

export const GlobalEmitter = new EventEmitter()

export const publishInvalidateCache = (message: PayloadChangeEvent) =>
  GlobalEmitter.emit(PayloadEmittertType.INVALIDATE, message)

export const onInvalidate = (callback: (message: PayloadChangeEvent) => void) =>
  GlobalEmitter.addListener(PayloadEmittertType.INVALIDATE, callback)
