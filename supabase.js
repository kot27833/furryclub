// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Замените на ваши реальные ключи из Supabase
const supabaseUrl = 'https://qjoxvktgslspdsvfbdpr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3h2a3Rnc2xzcGRzdmZiZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTUxNTcsImV4cCI6MjA3NjI3MTE1N30.HFc4FrKk47laka4k_8pQfSSCKgA6JISB_fDWlQLpZHw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Функции для работы с пользователями
export const authAPI = {
  // Регистрация
  async signUp(username, password) {
    // Проверяем, не занят ли username
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      throw new Error('Этот username уже занят')
    }

    // Создаем пользователя
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: username,
          password: password, // В реальном приложении нужно хэшировать!
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Вход
  async signIn(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Неверный username или пароль')
    return data
  },

  // Получить всех пользователей
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('username, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Функции для работы с постами
export const postsAPI = {
  // Создать пост
  async createPost(content, author) {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          content: content,
          author: author,
          likes_count: 0,
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Получить все посты
  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Удалить пост
  async deletePost(postId, author) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author', author)
    
    if (error) throw error
  },

  // Обновить количество лайков
  async updateLikes(postId, likesCount) {
    const { error } = await supabase
      .from('posts')
      .update({ likes_count: likesCount })
      .eq('id', postId)
    
    if (error) throw error
  }
}

// Функции для работы с лайками (будем хранить в отдельной таблице)
export const likesAPI = {
  // Создать таблицу лайков если ее нет
  async createLikesTable() {
    // В реальном приложении создавайте таблицу через SQL
    // CREATE TABLE likes (id BIGSERIAL PRIMARY KEY, post_id BIGINT, username TEXT, created_at TIMESTAMP)
  },

  // Лайкнуть пост
  async likePost(postId, username) {
    const { data, error } = await supabase
      .from('likes')
      .insert([
        {
          post_id: postId,
          username: username,
          created_at: new Date().toISOString()
        }
      ])
    
    if (error) throw error
    return data
  },

  // Убрать лайк
  async unlikePost(postId, username) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('username', username)
    
    if (error) throw error
  },

  // Получить лайки поста
  async getPostLikes(postId) {
    const { data, error } = await supabase
      .from('likes')
      .select('username')
      .eq('post_id', postId)
    
    if (error) throw error
    return data.map(like => like.username)
  },

  // Проверить, лайкнул ли пользователь пост
  async hasLiked(postId, username) {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('username', username)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 - no rows
    return !!data
  }
}

// Функции для работы с комментариями
export const commentsAPI = {
  // Добавить комментарий
  async addComment(postId, content, author) {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content: content,
          author: author,
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Получить комментарии поста
  async getComments(postId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  }
}

// Функции для работы с друзьями
export const friendsAPI = {
  // Добавить друга
  async addFriend(user1, user2) {
    const { data, error } = await supabase
      .from('friends')
      .insert([
        {
          user1: user1,
          user2: user2,
          created_at: new Date().toISOString()
        }
      ])
    
    if (error) throw error
    return data
  },

  // Получить друзей пользователя
  async getFriends(username) {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user1.eq.${username},user2.eq.${username}`)
    
    if (error) throw error
    return data || []
  },

  // Удалить друга
  async removeFriend(user1, user2) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user1.eq.${user1},user2.eq.${user2}),and(user1.eq.${user2},user2.eq.${user1})`)
    
    if (error) throw error
  }
}
