import { Groups, RunePlugin } from '../types'

export class ActionRunePlugin extends RunePlugin {
  name = 'ActionRune'
  description = 'A action rune'
  regexp = new RegExp(/(?<whole>@(?<action>[a-zA-Z_$][0-9a-zA-Z_$]*)(?<call>\((?<args>.*)\))?)/g)
  replacer({ action, args }: Groups) {
    return `get('${action}')(ctx, ${args || ''})`
  }
}
