import type { User, Post } from './types'

export class Database {
  private users: Map<number, User> = new Map()
  private posts: Map<number, Post> = new Map()
  private nextUserId = 1
  private nextPostId = 1

  // User operations
  createUser(userData: Omit<User, 'id'>): User {
    const user: User = {
      id: this.nextUserId++,
      ...userData
    }
    this.users.set(user.id, user)
    return user
  }

  getUser(id: number): User | undefined {
    return this.users.get(id)
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  updateUser(id: number, updates: Partial<Omit<User, 'id'>>): User | undefined {
    const user = this.users.get(id)
    if (user) {
      const updatedUser = { ...user, ...updates }
      this.users.set(id, updatedUser)
      return updatedUser
    }
    return undefined
  }

  deleteUser(id: number): boolean {
    return this.users.delete(id)
  }

  // Post operations
  createPost(postData: Omit<Post, 'id'>): Post {
    const post: Post = {
      id: this.nextPostId++,
      ...postData
    }
    this.posts.set(post.id, post)
    return post
  }

  getPost(id: number): Post | undefined {
    return this.posts.get(id)
  }

  getPostsByAuthor(authorId: number): Post[] {
    return Array.from(this.posts.values()).filter(post => post.authorId === authorId)
  }

  getAllPosts(): Post[] {
    return Array.from(this.posts.values())
  }

  deletePost(id: number): boolean {
    return this.posts.delete(id)
  }
}
