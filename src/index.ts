import { Problem } from "./problem.ts"
import { Result } from "./result.ts"
import { Utils } from "./utils.ts"


type ToResult<value> =
  (data: unknown) => Result<value, Problem>

type ValidatorHelper =
  <value>(toResult: ToResult<value>) => Validator<value>

const toValidator: ValidatorHelper = (toResult) => ({
  run: (data, handlers) => {
    const result = toResult(data)
    switch (result.kind) {
      case 'pass': return handlers.onPass(result.value)
      case 'fail': return handlers.onFail(result.reason)
    }
  },
  worksWith: ((data: unknown) => toResult(data).kind === 'pass') as any
})

const expecting = (expected: string) => (data: unknown): Result<any, Problem> =>
  typeof data === expected
    ? Result.pass(data)
    : Result.fail(Problem.expectation({ actual: Utils.typeOf(data), expected }))

const expectingNull = (data: unknown) =>
  (data === null)
    ? Result.pass(data)
    : Result.fail(Problem.expectation({ actual: Utils.typeOf(data), expected: 'null' }))

const expectingArray: <T>(validator: Validator<T>) => (data: unknown) => Result<T[], Problem> =
  (validator) => (data) => {
    if (data instanceof Array) {
      let values: any[] = []
      let reason: Problem | undefined = undefined
      for (var index = 0; index < data.length; index++) {
        validator.run(data[index], {
          onPass: value => { values.push(value) },
          onFail: reason_ => { reason = reason_ }
        })
        if (reason) return Result.fail(Problem.problemWithIndex({ index, problem: reason }))
      }
      return Result.pass(values)
    } else {
      return Result.fail(Problem.expectation({ actual: Utils.typeOf(data), expected: 'array' }))
    }
  }

const expectingOptional: <T>(validator: Validator<T>) => (data: unknown) => Result<T | undefined, Problem> =
  (validator) => (data) =>
    validator.run(data, {
      onPass: value => Result.pass(value),
      onFail: _ => Result.pass(undefined as any)
    })


type Fields<T> = {
  [K in keyof T]: Validator<T[K]>
}

const expectingObject: <T>(fields: Fields<T>) => (data: unknown) => Result<T, Problem> =
  (fields) => (data) => {
    if (typeof data !== 'object' || data === null)
      return Result.fail(Problem.expectation({ actual: Utils.typeOf(data), expected: 'object' }))

    let obj: any = {}
    let reason: Problem | undefined = undefined
    for (var key in fields) {
      fields[key].run((data as any)[key], {
        onPass: value => { obj[key] = value },
        onFail: reason_ => { reason = reason_ }
      })
      if (reason) return Result.fail(Problem.problemWithField({ field: key, problem: reason }))
    }
    return Result.pass(obj)
  }

export type Validator<value> = {
  worksWith: (data: unknown) => data is value
  run: <T, U>(data: unknown, handlers: {
    onPass: (value: value) => T,
    onFail: (reason: Problem) => U
  }) => T | U
}

export type Expect = {
  // primitives
  boolean: Validator<boolean>
  number: Validator<number>
  string: Validator<string>
  null: Validator<null>
  // aggregates
  object: <T>(fields: Fields<T>) => Validator<T>
  array: <T>(validator: Validator<T>) => Validator<T[]>
  optional: <T>(validator: Validator<T>) => Validator<T | undefined>
}

export const Expect: Expect = {
  // primitives
  boolean: toValidator(expecting('boolean')),
  number: toValidator(expecting('number')),
  string: toValidator(expecting('string')),
  null: toValidator(expectingNull),
  // aggregates
  object: (fields) => toValidator(expectingObject(fields)),
  array: (validator) => toValidator(expectingArray(validator)),
  optional: (validator) => toValidator(expectingOptional(validator))
}
