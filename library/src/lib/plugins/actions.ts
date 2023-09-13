import { addDataPlugin } from '../core'

export const ACTION = 'action'

export function addActionDataPlugin() {
  addDataPlugin(ACTION, {
    preprocessExpressions: [
      {
        name: 'action',
        description: 'turns @action(args) into actions.action(args)',
        regexp: new RegExp(/(?<whole>@(?<action>[a-zA-Z_$][0-9a-zA-Z_$]*)(?<call>\((?<args>.*)\))?)/g),
        replacer: ({ action, args }) => `actions.${action}({el,dataStack, actions}, ${args || ''})`,
      },
    ],
  })
}
