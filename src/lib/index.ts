import {
  addOnDataExtension,
  addShowDataExtension,
  addSignalDataExtension,
  addTextDataExtension,
} from '.'

export * from './dom'
export * from './eval'
export * from './extensions'
export * from './types'

export function addDefaultExtensions() {
  addSignalDataExtension()
  addOnDataExtension()
  addTextDataExtension()
  addShowDataExtension()
}
