import type { User, Post } from '../types'

export class Database {
  private users: User[] = []
  private posts: Post[] = []

  addUser(user: User): void {
    this.users.push(user)
  }

  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id)
  }

  addPost(post: Post): void {
    this.posts.push(post)
  }

  getPostsByUser(userId: number): Post[] {
    return this.posts.filter(p => p.authorId === userId)
  }
}
