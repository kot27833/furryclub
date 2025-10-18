// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://qjoxvktgslspdsvfbdpr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3h2a3Rnc2xzcGRzdmZiZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTUxNTcsImV4cCI6MjA3NjI3MTE1N30.HFc4FrKk47laka4k_8pQfSSCKgA6JISB_fDWlQLpZHw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Функция для проверки подключения
export async function checkConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) {
      console.error('Ошибка подключения к базе:', error)
      return false
    }
    console.log('✅ Подключение к базе успешно')
    return true
  } catch (error) {
    console.error('❌ Критическая ошибка подключения:', error)
    return false
  }
}

// Регистрация пользователя
export async function registerUser(username, password) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password }])
      .select()
    
    if (error) {
      if (error.code === '23505') throw new Error('Этот username уже занят')
      throw new Error('Ошибка базы данных: ' + error.message)
    }
    
    return data[0]
  } catch (error) {
    throw error
  }
}

// Вход пользователя
export async function loginUser(username, password) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') throw new Error('Неверный username или пароль')
      throw new Error('Ошибка базы данных: ' + error.message)
    }
    
    return data
  } catch (error) {
    throw error
  }
}

// Создать пост
export async function createPost(content, author) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ content, author, likes_count: 0 }])
    .select()
  
  if (error) throw error
  return data[0]
}

// Получить все посты
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Лайкнуть пост
export async function likePost(postId, username) {
  const { error } = await supabase
    .from('likes')
    .insert([{ post_id: postId, username }])
  
  if (error) throw error
  
  const likes = await getPostLikes(postId)
  await updateLikesCount(postId, likes.length)
}

// Убрать лайк
export async function unlikePost(postId, username) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('username', username)
  
  if (error) throw error
  
  const likes = await getPostLikes(postId)
  await updateLikesCount(postId, likes.length)
}

// Получить лайки поста
export async function getPostLikes(postId) {
  const { data, error } = await supabase
    .from('likes')
    .select('username')
    .eq('post_id', postId)
  
  if (error) throw error
  return data || []
}

// Проверить лайк
export async function hasLiked(postId, username) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('username', username)
  
  if (error) throw error
  return data.length > 0
}

// Обновить счетчик лайков
export async function updateLikesCount(postId, likesCount) {
  const { error } = await supabase
    .from('posts')
    .update({ likes_count: likesCount })
    .eq('id', postId)
  
  if (error) throw error
}

// Добавить комментарий
export async function addComment(postId, content, author) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id: postId, content, author }])
    .select()
  
  if (error) throw error
  return data[0]
}

// Получить комментарии
export async function getComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

// Добавить друга
export async function addFriend(user1, user2) {
  const { error } = await supabase
    .from('friends')
    .insert([{ user1, user2 }])
  
  if (error) throw error
}

// Получить друзей
export async function getFriends(username) {
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .or(`user1.eq.${username},user2.eq.${username}`)
  
  if (error) throw error
  return data || []
}

// Удалить друга
export async function removeFriend(user1, user2) {
  const { error } = await supabase
    .from('friends')
    .delete()
    .or(`and(user1.eq.${user1},user2.eq.${user2}),and(user1.eq.${user2},user2.eq.${user1})`)
  
  if (error) throw error
}

// Получить всех пользователей
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('username, created_at')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Удалить пост
export async function deletePost(postId, author) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author', author)
  
  if (error) throw error
}
