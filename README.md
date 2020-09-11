# ryannhg/safe-json
> Safely handle unknown JSON in Typescript

## installation

```
npm install @ryannhg/safe-json
```

## the problem

When our applications receive data from randos on the internet, we don't know what to expect! With Typescript, the easiest way to handle this uncertainty is by using the `any` keyword. For example, [Express does this for `req.body`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/74bd5ff6c586d89acaec4331e02b895a199da0fc/types/express/index.d.ts#L108). 

This leads to _one_ minor issue... it breaks our entire type system!

```ts
const increment = (a: number) => a + 1

const data : any = { counter: '2' }
const value = increment(data.counter)

console.log(value) // "21"
```

That `any` type broke the safety of our `increment` function! 

__What's even worse?__ TypeScript thinks `value` is a `number` now! _Ah!_ It's like we're just using JS again!! 

## an ideal solution

What should we do instead?

The unknown JSON from before should really be treated as an `unknown`. [The unknown type](https://www.typescriptlang.org/docs/handbook/basic-types.html#unknown) reminds us to check our JSON before passing it around, so it won't break everything like a sneaky snek! 🐍

Here's the same code from before, but using `unknown`:

```ts
const increment = (a: number) => a + 1

const data : unknown = { counter: '2' }
const value = increment(data.counter) // Type error!
```

We need to convert the `unknown` to a `{ counter : number }` type.

Unfortunately, working with `unknown` values is a pain. Proving that `data` is an `object` is easy, but Typescript yells when accessing properties like `counter`. Most handwritten solutions involve using `any` or `as` keywords, which is the whole situation we are trying to avoid!

## the solution

This is where a smaller library can save us a lot of headache. 

```ts
import { Expect, Validator } from '@ryannhg/safe-json'

const increment = (a: number) => a + 1

const data : unknown = { counter: '2' }

// Step 1. Define the type we expect
type OurData = {
  counter: number
}

// Step 2. Define a validator
const ourValidator : Validator<OurData> =
  Expect.object({
    counter: Expect.number
  })

// Step 3. Validate the unknown data
if (ourValidator.worksWith(data)) {
  // ✅ `data` is now the "OurData" type
  const value = increment(data.counter)
}
```

## API

Ready to try it out? Theres's not much to learn!

__Creating Validators__

- [Expect.boolean](#Expect.boolean)
- [Expect.number](#Expect.number)
- [Expect.string](#Expect.string)
- [Expect.null](#Expect.null)
- [Expect.object](#Expect.object)
- [Expect.array](#Expect.array)
- [Expect.optional](#Expect.optional)

__Validating JSON__

- [validator.worksWith](#validator.worksWith)
- [validator.run](#validator.run)

### Expect.boolean

Safely handle `boolean` values.

```ts
Expect.boolean : Validator<boolean>
```

```ts
Expect.boolean.worksWith(true)       // ✅
Expect.boolean.worksWith(false)      // ✅
Expect.boolean.worksWith(undefined)  // 🚫
Expect.boolean.worksWith('true')     // 🚫
Expect.boolean.worksWith(null)       // 🚫
Expect.boolean.worksWith(0)          // 🚫
```

### Expect.number

Safely handle `number` values.

```ts
Expect.number : Validator<number>
```

```ts
Expect.number.worksWith(123)        // ✅
Expect.number.worksWith(2.5)        // ✅
Expect.number.worksWith(-12)        // ✅
Expect.number.worksWith(0)          // ✅
Expect.number.worksWith('12')       // 🚫
Expect.number.worksWith(null)       // 🚫
```

### Expect.string

Safely handle `string` values.

```ts
Expect.string : Validator<string>
```

```ts
Expect.string.worksWith('123')        // ✅
Expect.string.worksWith('true')       // ✅
Expect.string.worksWith(123)          // 🚫
Expect.string.worksWith(true)         // 🚫
Expect.string.worksWith(undefined)    // 🚫
Expect.string.worksWith(null)         // 🚫
```

### Expect.null

Safely handle `null` values.

```ts
Expect.null : Validator<null>
```

```ts
Expect.null.worksWith(null)       // ✅
Expect.null.worksWith(undefined)  // 🚫
Expect.null.worksWith('null')     // 🚫
Expect.null.worksWith(false)      // 🚫
Expect.null.worksWith(0)          // 🚫
```

### Expect.object

Safely handle `object` values. Provide an object mapping field name to any other `Validator`. You can even reuse validators you defined before!

```ts
Expect.object : <T>(fields: Fields<T>) => Validator<T>
```

```ts
type Person = { name: string, age: number }

const person: Validator<Person> =
  Expect.object({
    name: Expect.string,
    age: Expect.number
  })

person.worksWith({ name: 'ryan', age: 26 })   // ✅
person.worksWith({ name: 'ryan', age: "26" }) // 🚫
person.worksWith({ nam: 'ryan',  age: 26 })   // 🚫
person.worksWith({ name: 'ryan' })            // 🚫
person.worksWith({ age: 26 })                 // 🚫
person.worksWith(null)                        // 🚫
```

### Expect.array

Safely handle `array` values of the same type! 

```ts
Expect.array : <T>(validator: Validator<T>) => Validator<T[]>
```

```ts
Expect.array(Expect.number).worksWith([])             // ✅
Expect.array(Expect.number).worksWith([ 1, 2, 3 ])    // ✅
Expect.array(Expect.number).worksWith([ 1, null, 3 ]) // 🚫
Expect.array(Expect.number).worksWith([ 1, 2, '3' ])  // 🚫
Expect.array(Expect.number).worksWith(null)           // 🚫
```

### Expect.optional

Allows a value to be optional. Always succeeds, but is `undefined` if the value couldn't be parsed from the JSON.

```ts
Expect.optional : <T>(validator: Validator<T>) => Validator<T | undefined>
```

```ts
const maybeNumber : Validator<number | undefined> =
  Expect.optional(Expect.number)

maybeNumber.worksWith(123)        // ✅ 
maybeNumber.worksWith(456)        // ✅ (456)
maybeNumber.worksWith(null)       // ✅ (undefined)
maybeNumber.worksWith(undefined)  // ✅ (undefined)
maybeNumber.worksWith(true)       // ✅ (undefined)
```

### validator.worksWith

Allows you to test your unknown data against a `Validator<T>`. If the `worksWith` function returns `true`, the data is guaranteed to be the correct type.

```ts
worksWith: (data: unknown) => data is value
```

```ts
type Person = { name : string }

const person : Validator<Person> =
  Expect.object({
    name: Expect.string
  })
```

__✅ Pass Example__

```ts
const data = { name: "Ryan" }

if (person.worksWith(data)) {
  console.log(data.name)
} else {
  console.error('Not a person!')
}
```

This code prints `"Ryan"`, because the data __passed__ validation.

__🚫 Fail Example__

```ts
const data = { name: null }

if (person.worksWith(data)) {
  console.log(data.name)
} else {
  console.error('Not a person!')
}
```

This code prints `"Not a person!"`, because the data __failed__ validation.



### validator.run

The `run` function is another way to handle the branching logic, or provide a fallback if you'd like.

In the event of a failure, it also provides a `reason` that the JSON failed validation!

```ts
run: <T, U>(data: unknown, handlers: {
    onPass: (value: value) => T,
    onFail: (reason: Problem) => U
  }) => T | U
```

```ts
type Person = { name : string }

const person : Validator<Person> =
  Expect.object({
    name: Expect.string
  })
```

__✅ Pass Example__

```ts
person.run({ name: "Ryan" }, {
  onPass: person => console.log(person.name),
  onFail: reason => console.error(reason)
})
```

This code prints `"Ryan"`, because the data __passed__ validation.

__🚫 Fail Example__

```ts
person.run({ name: null }, {
  onPass: person => console.log(person.name),
  onFail: reason => console.error(reason)
})
```

This code prints 
```ts
'Problem with field "name": Expecting a string, but got null.'
```
because the data __failed__ validation.


## inspiration

Like all good things in my life, I stole it from [Elm](https://elm-lang.org). There's a package called `elm/json` that converts raw JSON from the outside world into reliable values you can trust in your application.

__Check out that package here:__

https://package.elm-lang.org/packages/elm/json/latest/