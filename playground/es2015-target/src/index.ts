// ES2015+ 特性示例，会被 Oxc 转换为 ES2015 兼容代码

// 1. 箭头函数和解构赋值
export const processUser = (user: { name: string; age: number; email?: string }) => {
  const { name, age, email = 'no-email' } = user
  return `${name} (${age}) - ${email}`
}

// 2. 模板字符串和默认参数
export function createMessage(title: string, content: string = 'No content') {
  return `Message: ${title}\n${content}`
}

// 3. 类和继承
export class BaseService {
  protected name: string
  
  constructor(name: string) {
    this.name = name
  }
  
  getName() {
    return this.name
  }
}

export class UserService extends BaseService {
  private users: Map<string, any> = new Map()
  
  constructor() {
    super('UserService')
  }
  
  // 使用 async/await (会被转换为 Promise)
  async addUser(user: { id: string; name: string }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.users.set(user.id, user)
        resolve(user)
      }, 100)
    })
  }
  
  // 使用 for...of 循环
  getAllUsers() {
    const result = []
    for (const [id, user] of this.users) {
      result.push({ id, ...user })
    }
    return result
  }
}

// 4. 对象展开和剩余参数
export function mergeConfig(base: Record<string, any>, ...overrides: Record<string, any>[]) {
  return overrides.reduce((acc, override) => ({ ...acc, ...override }), base)
}

// 5. 数组方法链式调用
export function processNumbers(numbers: number[]) {
  return numbers
    .filter(n => n > 0)
    .map(n => n * 2)
    .reduce((sum, n) => sum + n, 0)
}

// 6. Symbol 和 WeakMap (ES2015 特性)
export const SECRET_KEY = Symbol('secret')
export const cache = new WeakMap()

// 7. 生成器函数
export function* fibonacci(max: number) {
  let a = 0, b = 1
  while (a < max) {
    yield a
    ;[a, b] = [b, a + b]
  }
}

// 8. Proxy (ES2015 特性)
export function createObservable<T extends Record<string, any>>(target: T) {
  return new Proxy(target, {
    set(obj, prop, value) {
      console.log(`Setting ${String(prop)} to ${value}`)
      obj[prop as keyof T] = value
      return true
    }
  })
}

// 默认导出
export default {
  processUser,
  createMessage,
  UserService,
  mergeConfig,
  processNumbers,
  fibonacci,
  createObservable
}
