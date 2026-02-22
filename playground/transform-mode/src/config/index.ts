export interface AppConfig {
  port: number
  host: string
  debug: boolean
}

export class Config {
  private config: AppConfig

  constructor(config: Partial<AppConfig> = {}) {
    this.config = {
      port: 3000,
      host: 'localhost',
      debug: false,
      ...config
    }
  }

  get(key: keyof AppConfig): AppConfig[typeof key] {
    return this.config[key]
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
  }
}
