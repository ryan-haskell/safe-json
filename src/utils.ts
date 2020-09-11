export const Utils = {
  typeOf: (data: unknown): string =>
    data instanceof Array ? 'array'
      : data === null ? 'null'
        : typeof data
}