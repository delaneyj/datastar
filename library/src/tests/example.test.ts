import { expect, test } from 'vitest'

test('adds 1 + 2 to equal 3!', () => {
  const sum = (a: number, b: number) => a + b
  expect(sum(1, 2)).toBe(3)
})
