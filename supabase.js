// supabase.js
const SUPABASE_URL = 'https://qjoxvktgslspdsvfbdpr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3h2a3Rnc2xzcGRzdmZiZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTUxNTcsImV4cCI6MjA3NjI3MTE1N30.HFc4FrKk47laka4k_8pQfSSCKgA6JISB_fDWlQLpZHw';

// Глобальные функции для работы с Supabase
window.supabaseAPI = {
    // Регистрация
    async registerUser(username, password) {
        try {
            const response = await fetch(SUPABASE_URL + '/rest/v1/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                if (error.code === '23505') {
                    throw new Error('Этот username уже занят');
                }
                throw new Error('Ошибка регистрации');
            }
            
            const data = await response.json();
            return data[0];
        } catch (error) {
            throw error;
        }
    },

    // Вход
    async loginUser(username, password) {
        try {
            const response = await fetch(SUPABASE_URL + `/rest/v1/users?username=eq.${username}&password=eq.${password}&select=*`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                }
            });
            
            if (!response.ok) throw new Error('Ошибка входа');
            
            const data = await response.json();
            if (data.length === 0) throw new Error('Неверный username или пароль');
            
            return data[0];
        } catch (error) {
            throw error;
        }
    },

    // Получить данные пользователя
    async getUser(username) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/users?username=eq.${username}&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data[0];
    },

    // Обновить профиль
    async updateProfile(username, bio, city, birthday) {
        await fetch(SUPABASE_URL + `/rest/v1/users?username=eq.${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                bio: bio,
                city: city,
                birthday: birthday
            })
        });
    },

    // Сменить пароль
    async changePassword(username, newPassword) {
        await fetch(SUPABASE_URL + `/rest/v1/users?username=eq.${username}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                password: newPassword
            })
        });
    },

    // Создать пост
    async createPost(content, author) {
        const response = await fetch(SUPABASE_URL + '/rest/v1/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                content: content,
                author: author,
                likes_count: 0
            })
        });
        
        const data = await response.json();
        return data[0];
    },

    // Получить посты
    async getPosts() {
        const response = await fetch(SUPABASE_URL + '/rest/v1/posts?select=*&order=created_at.desc', {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    },

    // Получить посты пользователя
    async getUserPosts(username) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/posts?author=eq.${username}&select=*&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    },

    // Лайкнуть пост
    async likePost(postId, username) {
        await fetch(SUPABASE_URL + '/rest/v1/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                post_id: postId,
                username: username
            })
        });
        
        const likes = await this.getPostLikes(postId);
        await this.updateLikesCount(postId, likes.length);
    },

    // Убрать лайк
    async unlikePost(postId, username) {
        await fetch(SUPABASE_URL + `/rest/v1/likes?post_id=eq.${postId}&username=eq.${username}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const likes = await this.getPostLikes(postId);
        await this.updateLikesCount(postId, likes.length);
    },

    // Получить лайки
    async getPostLikes(postId) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/likes?post_id=eq.${postId}&select=username`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    },

    // Проверить лайк
    async hasLiked(postId, username) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/likes?post_id=eq.${postId}&username=eq.${username}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data.length > 0;
    },

    // Обновить счетчик лайков
    async updateLikesCount(postId, likesCount) {
        await fetch(SUPABASE_URL + `/rest/v1/posts?id=eq.${postId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                likes_count: likesCount
            })
        });
    },

    // Добавить комментарий
    async addComment(postId, content, author) {
        const response = await fetch(SUPABASE_URL + '/rest/v1/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                post_id: postId,
                content: content,
                author: author
            })
        });
        
        const data = await response.json();
        return data[0];
    },

    // Получить комментарии
    async getComments(postId) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/comments?post_id=eq.${postId}&select=*&order=created_at.asc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    },

    // Добавить друга
    async addFriend(user1, user2) {
        await fetch(SUPABASE_URL + '/rest/v1/friends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                user1: user1,
                user2: user2
            })
        });
    },

    // Получить друзей
    async getFriends(username) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/friends?or=(user1.eq.${username},user2.eq.${username})`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    },

    // Удалить друга
    async removeFriend(user1, user2) {
        await fetch(SUPABASE_URL + `/rest/v1/friends?or=(and(user1.eq.${user1},user2.eq.${user2}),and(user1.eq.${user2},user2.eq.${user1}))`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
    },

    // Получить всех пользователей
    async getAllUsers() {
        const response = await fetch(SUPABASE_URL + '/rest/v1/users?select=username,created_at,bio,city&order=created_at.desc', {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    },

    // Удалить пост
    async deletePost(postId, author) {
        await fetch(SUPABASE_URL + `/rest/v1/posts?id=eq.${postId}&author=eq.${author}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
    },

    // Отправить сообщение
    async sendMessage(sender, receiver, content) {
        const response = await fetch(SUPABASE_URL + '/rest/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                sender: sender,
                receiver: receiver,
                content: content
            })
        });
        
        const data = await response.json();
        return data[0];
    },

    // Получить сообщения
    async getMessages(user1, user2) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/messages?or=(and(sender.eq.${user1},receiver.eq.${user2}),and(sender.eq.${user2},receiver.eq.${user1}))&select=*&order=created_at.asc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    },

    // Получить чаты пользователя
    async getChats(username) {
        const response = await fetch(SUPABASE_URL + `/rest/v1/messages?select=sender,receiver,content,created_at&or=(sender.eq.${username},receiver.eq.${username})&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
        
        const data = await response.json();
        return data || [];
    }
};
