import { datastar } from './lib'

const foo = datastar.refs.foo as HTMLCanvasElement
foo.classList.add('bg-primary', 'w-32', 'h-32', 'rounded-full')
foo.setAttribute('width', '128px')
foo.setAttribute('height', '128px')
const ctx = foo.getContext('2d')!
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillStyle = 'white'
ctx.fillText('Used data-ref to modify', 64, 64)
