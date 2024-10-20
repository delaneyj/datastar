import { runDatastarWithAllPlugins, runForInspector } from '../lib'

if (!window.ds) {
  runForInspector(() => runDatastarWithAllPlugins())
}
