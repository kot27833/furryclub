// Функции для пользователей
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
}

function saveUser(username, password) {
    const users = getUsers();
    
    // Проверяем, не занят ли ник
    if (users[username]) {
        return false; // ник занят
    }
    
    users[username] = {
        username: username,
        password: password,
        joined: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    return true; // успешно
}

// Функции для постов
function getPosts() {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
}

function savePost(post) {
    const posts = getPosts();
    posts.unshift(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Проверка авторизации
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userWelcome').textContent = 'Привет, ' + currentUser + '!';
}

// Регистрация
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (username.length < 3) {
        alert('Ник должен быть至少 3 символа!');
        return;
    }
    
    if (password.length < 4) {
        alert('Пароль должен быть至少 4 символа!');
        return;
    }
    
    const success = saveUser(username, password);
    
    if (success) {
        alert('Аккаунт создан! Теперь войдите.');
        window.location.href = 'login.html';
    } else {
        alert('Этот ник уже занят! Придумайте другой.');
    }
});

// Вход
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const users = getUsers();
    const user = users[username];
    
    if (user && user.password === password) {
        localStorage.setItem('currentUser', username);
        window.location.href = 'index.html';
    } else {
        alert('Неверный ник или пароль!');
    }
});

// Посты
function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;
    
    const posts = getPosts();
    const currentUser = localStorage.getItem('currentUser');
    
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>Пока нет постов. Будьте первым!</p>';
        return;
    }
    
    posts.forEach(post => {
        const hasLiked = post.likes && post.likes.includes(currentUser);
        
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <strong>${post.author}</strong>
                <span>${new Date(post.timestamp).toLocaleString()}</span>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button onclick="likePost('${post.id}')" class="like-btn ${hasLiked ? 'liked' : ''}">
                    ❤️ ${post.likes ? post.likes.length : 0}
                </button>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
    });
}

function createPost() {
    const postText = document.getElementById('postText');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!postText.value.trim()) {
        alert('Напишите что-нибудь!');
        return;
    }
    
    const newPost = {
        id: Date.now().toString(),
        author: currentUser,
        content: postText.value,
        timestamp: new Date().toISOString(),
        likes: []
    };
    
    savePost(newPost);
    postText.value = '';
    loadPosts();
}

function likePost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    const currentUser = localStorage.getItem('currentUser');
    
    if (!post.likes) post.likes = [];
    
    const userIndex = post.likes.indexOf(currentUser);
    
    if (userIndex === -1) {
        post.likes.push(currentUser);
    } else {
        post.likes.splice(userIndex, 1);
    }
    
    // Обновляем пост
    const updatedPosts = posts.map(p => p.id === postId ? post : p);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    loadPosts();
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}