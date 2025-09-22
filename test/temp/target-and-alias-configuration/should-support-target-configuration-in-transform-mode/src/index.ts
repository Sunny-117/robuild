export const test = async () => {
  const obj = { a: 1, b: 2 }
  const { a, ...rest } = obj
  return { a, rest }
}