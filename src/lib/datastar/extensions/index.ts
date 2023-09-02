import { addBindDataExtension } from './bind.js'
import { addFocusDataExtension } from './focus.js'
import { addAllFragmentExtensions } from './fragments.js'
import { addOnDataExtension } from './on.js'
import { addRefDataExtension } from './ref.js'
import { addShowDataExtension } from './show.js'
import { addSignalDataExtension } from './signal.js'
import { addTeleportDataExtension } from './teleport.js'
import { addTextDataExtension } from './text.js'

export * from './bind.js'
export * from './focus.js'
export * from './fragments.js'
export * from './intersects.js'
export * from './on.js'
export * from './ref.js'
export * from './show.js'
export * from './signal.js'
export * from './teleport.js'
export * from './text.js'

export function addAllIncludedExtensions() {
  addSignalDataExtension()
  addBindDataExtension()
  addFocusDataExtension()
  addAllFragmentExtensions()
  addOnDataExtension()
  addRefDataExtension()
  addShowDataExtension()
  addTeleportDataExtension()
  addTextDataExtension()
}
