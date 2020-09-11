export type Result<value, reason>
  = Pass<value>
  | Fail<reason>

type Pass<value> = { kind: 'pass', value: value }
const pass: <value>(value: value) => Pass<value> =
  (value) => ({ kind: 'pass', value })

type Fail<reason> = { kind: 'fail', reason: reason }
const fail: <reason>(reason: reason) => Fail<reason> =
  (reason) => ({ kind: 'fail', reason })

export const Result = { pass, fail }
