import { Computed } from '~/plugins/official/core/attributes/computed'
import { Signals } from '~/plugins/official/core/attributes/signals'
import { Star } from '~/plugins/official/core/attributes/star'
import { SignalValueMacro } from '~/plugins/official/core/macros/signals'
import { Engine } from './engine'

const DS = new Engine()
DS.load(Star, SignalValueMacro, Signals, Computed)
export const Datastar = DS
