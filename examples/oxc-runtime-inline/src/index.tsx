/**
 * 示例：使用 async/await 语法
 * 当 target 设置为 es2015 时，这些代码会被转换并使用 @oxc-project/runtime 的 helper
 */

export async function fetchData() {
  const response = await fetch('https://api.example.com/data')
  return response.json()
}

export const asyncArrow = async () => {
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
