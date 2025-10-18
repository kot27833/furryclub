// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ЗАМЕНИТЕ НА ВАШИ РЕАЛЬНЫЕ КЛЮЧИ!
const supabaseUrl = 'https://ваш-project-id.supabase.co'
const supabaseAnonKey = 'ваш-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Функция для проверки подключения
export async function checkConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) {
      console.error('Ошибка подключения к базе:', error)
      return false
    }
    console.log('Подключение к базе успешно')
    return true
  } catch (error) {
    console.error('Критическая ошибка подключения:', error)
    return false
  }
}

// Регистрация пользователя
export async function registerUser(username, password) {
  try {
    console.log('Попытка регистрации:', username)
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: username,
          password: password
        }
      ])
      .select()
    
    if (error) {
      console.error('Ошибка Supabase при регистрации:', error)
      if (error.code === '23505') {
        throw new Error('Этот username уже занят')
      }
      throw new Error('Ошибка базы данных: ' + error.message)
    }
    
    if (!data || data.length === 0) {
      throw new Error('Пользователь не был создан')
    }
    
    console.log('Успешная регистрация:', data[0])
    return data[0]
  } catch (error) {
    console.error('Общая ошибка регистрации:', error)
    throw error
  }
}

// Вход пользователя
export async function loginUser(username, password) {
  try {
    console.log('Попытка входа:', username)
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()
    
    if (error) {
      console.error('Ошибка Supabase при входе:', error)
      if (error.code === 'PGRST116') {
        throw new Error('Неверный username или пароль')
      }
      throw new Error('Ошибка базы данных: ' + error.message)
    }
    
    if (!data) {
      throw new Error('Неверный username или пароль')
    }
    
    console.log('Успешный вход:', data)
    return data
  } catch (error) {
    console.error('Общая ошибка входа:', error)
    throw error
  }
}

// Создать пост
export async function createPost(content, author) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          content: content,
          author: author,
          likes_count: 0
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Ошибка создания поста:', error)
    throw error
  }
}

// Получить все посты
export async function getPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Ошибка получения постов:', error)
    return []
  }
}

// Лайкнуть пост
export async function likePost(postId, username) {
  try {
    const { error } = await supabase
      .from('likes')
      .insert([
        {
          post_id: postId,
          username: username
        }
      ])
    
    if (error) throw error
    
    // Обновляем счетчик лайков
    const likes = await getPostLikes(postId)
    await updateLikesCount(postId, likes.length)
  } catch (error) {
    console.error('Ошибка лайка:', error)
    throw error
  }
}

// Убрать лайк
export async function unlikePost(postId, username) {
  try {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('username', username)
    
    if (error) throw error
    
    // Обновляем счетчик лайков
    const likes = await getPostLikes(postId)
    await updateLikesCount(postId, likes.length)
  } catch (error) {
    console.error('Ошибка удаления лайка:', error)
    throw error
  }
}

// Получить лайки поста
export async function getPostLikes(postId) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('username')
      .eq('post_id', postId)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Ошибка получения лайков:', error)
    return []
  }
}

// Проверить лайк
export async function hasLiked(postId, username) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('username', username)
    
    if (error) throw error
    return data.length > 0
  } catch (error) {
    console.error('Ошибка проверки лайка:', error)
    return false
  }
}

// Обновить счетчик лайков
export async function updateLikesCount(postId, likesCount) {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ likes_count: likesCount })
      .eq('id', postId)
    
    if (error) throw error
  } catch (error) {
    console.error('Ошибка обновления счетчика:', error)
    throw error
  }
}

// Добавить комментарий
export async function addComment(postId, content, author) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content: content,
          author: author
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Ошибка добавления комментария:', error)
    throw error
  }
}

// Получить комментарии
export async function getComments(postId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Ошибка получения комментариев:', error)
    return []
  }
}

// Добавить друга
export async function addFriend(user1, user2) {
  try {
    const { error } = await supabase
      .from('friends')
      .insert([
        {
          user1: user1,
          user2: user2
        }
      ])
    
    if (error) throw error
  } catch (error) {
    console.error('Ошибка добавления друга:', error)
    throw error
  }
}

// Получить друзей
export async function getFriends(username) {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user1.eq.${username},user2.eq.${username}`)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Ошибка получения друзей:', error)
    return []
  }
}

// Удалить друга
export async function removeFriend(user1, user2) {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user1.eq.${user1},user2.eq.${user2}),and(user1.eq.${user2},user2.eq.${user1})`)
    
    if (error) throw error
  } catch (error) {
    console.error('Ошибка удаления друга:', error)
    throw error
  }
}

// Получить всех пользователей
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Ошибка получения пользователей:', error)
    return []
  }
}

// Удалить пост
export async function deletePost(postId, author) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author', author)
    
    if (error) throw error
  } catch (error) {
    console.error('Ошибка удаления поста:', error)
    throw error
  }
}
