export interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  createdAt: Date
  published: boolean
}
