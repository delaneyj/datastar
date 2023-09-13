import { addActionDataPlugin } from './actions.js'
import { addBindDataPlugin } from './bind.js'
import { addFocusDataPlugin } from './focus.js'
import { addAllFragmentPlugins } from './fragments.js'
import { addModelDataPlugin } from './model.js'
import { addOnDataPlugin } from './on.js'
import { addRefDataPlugin } from './ref.js'
import { addShowDataPlugin } from './show.js'
import { addSignalDataPlugin } from './signal.js'
import { addTeleportDataPlugin } from './teleport.js'
import { addTextDataPlugin } from './text.js'

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

export function addAllIncludedPlugins() {
  addActionDataPlugin()
  addSignalDataPlugin()
  addBindDataPlugin()
  addModelDataPlugin()
  addFocusDataPlugin()
  addAllFragmentPlugins()
  addOnDataPlugin()
  addRefDataPlugin()
  addShowDataPlugin()
  addTeleportDataPlugin()
  addTextDataPlugin()
}
