import { Expect, Validator } from "../src/index"

test('Expect.boolean', () => {
  expect(Expect.boolean.worksWith(true)).toBe(true)
  expect(Expect.boolean.worksWith(false)).toBe(true)
  expect(Expect.boolean.worksWith(undefined)).toBe(false)
  expect(Expect.boolean.worksWith('true')).toBe(false)
  expect(Expect.boolean.worksWith(null)).toBe(false)
  expect(Expect.boolean.worksWith(0)).toBe(false)
})

test('Expect.number', () => {
  expect(Expect.number.worksWith(123)).toBe(true)
  expect(Expect.number.worksWith(2.5)).toBe(true)
  expect(Expect.number.worksWith(-12)).toBe(true)
  expect(Expect.number.worksWith(0)).toBe(true)
  expect(Expect.number.worksWith('12')).toBe(false)
  expect(Expect.number.worksWith(null)).toBe(false)
})

test('Expect.string', () => {
  expect(Expect.string.worksWith('123')).toBe(true)
  expect(Expect.string.worksWith('true')).toBe(true)
  expect(Expect.string.worksWith(123)).toBe(false)
  expect(Expect.string.worksWith(true)).toBe(false)
  expect(Expect.string.worksWith(undefined)).toBe(false)
  expect(Expect.string.worksWith(null)).toBe(false)
})

test('Expect.null', () => {
  expect(Expect.null.worksWith(null)).toBe(true)
  expect(Expect.null.worksWith(undefined)).toBe(false)
  expect(Expect.null.worksWith('null')).toBe(false)
  expect(Expect.null.worksWith(false)).toBe(false)
  expect(Expect.null.worksWith(0)).toBe(false)
})

test('Expect.object', () => {
  type Person = { name: string, age: number }

  const person: Validator<Person> =
    Expect.object({
      name: Expect.string,
      age: Expect.number
    })

  expect(person.worksWith({ name: 'alexa', age: 93 })).toBe(true)
  expect(person.worksWith({ name: 'ryan', age: 26 })).toBe(true)
  expect(person.worksWith({ name: 'ryan', age: "26" })).toBe(false)
  expect(person.worksWith({ nam: 'ryan', age: 26 })).toBe(false)
  expect(person.worksWith({ name: 'ryan' })).toBe(false)
  expect(person.worksWith({ age: 26 })).toBe(false)
  expect(person.worksWith(null)).toBe(false)
})

test('Expect.array', () => {
  const numbers: Validator<number[]> =
    Expect.array(Expect.number)

  expect(numbers.worksWith([])).toBe(true)
  expect(numbers.worksWith([1, 2, 3])).toBe(true)
  expect(numbers.worksWith([1, null, 3])).toBe(false)
  expect(numbers.worksWith([1, 2, '3'])).toBe(false)
  expect(numbers.worksWith(null)).toBe(false)
})

test('Expect.optional', () => {
  const maybeNumber: Validator<number | undefined> =
    Expect.optional(Expect.number)

  expect(maybeNumber.worksWith(123)).toBe(true)
  expect(maybeNumber.worksWith(456)).toBe(true)
  expect(maybeNumber.worksWith(null)).toBe(true)
  expect(maybeNumber.worksWith(undefined)).toBe(true)
  expect(maybeNumber.worksWith(true)).toBe(true)
})