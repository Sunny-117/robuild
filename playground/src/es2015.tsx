/**
 * 示例：使用 async/await 语法
 * 当 target 设置为 es2015 时，这些代码会被转换并使用 @oxc-project/runtime 的 helper
 */

async function mockApi() {
  return Promise.resolve({
    data: 'success',
  })
}
export async function fetchData() {
  const response = await mockApi()
  return response.data
}

export async function asyncArrow() {
  await Promise.resolve()
  return 'done'
}

export class AsyncClass {
  async method() {
    const result = await this.helper()
    return result
  }

  private async helper() {
    return 'helper result'
  }
}

// 对象解构（也可能需要 helper）
export const { a, ...rest } = { a: 1, b: 2, c: 3 }

export async function run() {
  console.log(await fetchData())
  console.log(await asyncArrow())
  console.log(new AsyncClass().method())
  console.log({ a, ...rest })
}
