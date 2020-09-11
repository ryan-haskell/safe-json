export type Problem
  = { kind: 'expectation', data: Expectation }
  | { kind: 'field', data: ProblemWithField }
  | { kind: 'index', data: ProblemWithIndex }

type Expectation = { expected: string, actual: string }
type ProblemWithField = { field: string, problem: Problem }
type ProblemWithIndex = { index: number, problem: Problem }

export const Problem = {
  // problems
  expectation: (data: Expectation): Problem => ({ kind: 'expectation', data }),
  problemWithField: (data: ProblemWithField): Problem => ({ kind: 'field', data }),
  problemWithIndex: (data: ProblemWithIndex): Problem => ({ kind: 'index', data }),
  // utils
  toString: (problem: Problem): string => {
    switch (problem.kind) {
      case 'expectation': return `Expected ${problem.data.expected}, got ${problem.data.actual}.`
      case 'field': return `Problem with field "${problem.data.field}": ${Problem.toString(problem.data.problem)}`
      case 'index': return `Problem at index "${problem.data.index}": ${Problem.toString(problem.data.problem)}`
    }
  }
}