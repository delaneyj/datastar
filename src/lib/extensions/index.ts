import { addBindDataExtension } from './bind.ts'
import { addFocusDataExtension } from './focus.ts'
import { addAllFragmentExtensions } from './fragments.ts'
import { addOnDataExtension } from './on.ts'
import { addRefDataExtension } from './ref.ts'
import { addShowDataExtension } from './show.ts'
import { addSignalDataExtension } from './signals.ts'
import { addTeleportDataExtension } from './teleport.ts'
import { addTextDataExtension } from './text.ts'

export * from './bind.ts'
export * from './focus.ts'
export * from './fragments.ts'
export * from './intersects.ts'
export * from './on.ts'
export * from './ref.ts'
export * from './show.ts'
export * from './signals.ts'
export * from './teleport.ts'
export * from './text.ts'

export function addAllIncludedExtensions() {
  addBindDataExtension()
  addFocusDataExtension()
  addAllFragmentExtensions()
  addOnDataExtension()
  addRefDataExtension()
  addShowDataExtension()
  addSignalDataExtension()
  addTeleportDataExtension()
  addTextDataExtension()
}
