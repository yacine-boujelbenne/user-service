const API_URL = 'http://127.0.0.1:4000/api';

// Elements
const createUserBtn = document.getElementById('create-user-btn');
const createPostBtn = document.getElementById('create-post-btn');
const userModal = document.getElementById('user-modal');
const postModal = document.getElementById('post-modal');
const commentModal = document.getElementById('comment-modal');
const userForm = document.getElementById('user-form');
const postForm = document.getElementById('post-form');
const commentForm = document.getElementById('comment-form');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  loadPosts();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // User Modal
  if (createUserBtn) {
    createUserBtn.addEventListener('click', () => {
      userModal.classList.remove('hidden');
      userModal.classList.add('flex');
    });
  }
  
  // Post Modal
  if (createPostBtn) {
    createPostBtn.addEventListener('click', () => {
      postModal.classList.remove('hidden');
      postModal.classList.add('flex');
    });
  }
  
  // Close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  });
  
  // Forms
  if (userForm) userForm.addEventListener('submit', handleCreateUser);
  if (postForm) postForm.addEventListener('submit', handleCreatePost);
  if (commentForm) commentForm.addEventListener('submit', handleCreateComment);
}

// Load Users
async function loadUsers() {
  try {
    console.log('Loading users from:', `${API_URL}/users`);
    const response = await fetch(`${API_URL}/users`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const users = await response.json();
    console.log('Users loaded:', users);
    displayUsers(users);
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('users-list').innerHTML = 
      `<div class="col-span-full text-center text-red-500">
        <p>❌ Error loading users</p>
        <p class="text-sm">${error.message}</p>
      </div>`;
  }
}

function displayUsers(users) {
  const usersList = document.getElementById('users-list');
  
  if (!users || users.length === 0) {
    usersList.innerHTML = '<div class="col-span-full text-center text-gray-500">No users yet. Create one!</div>';
    return;
  }
  
  usersList.innerHTML = users.map(user => {
    const userId = formatId(user._id);
    const dateStr = formatDate(user.createdAt);
    
    return `
    <div class="bg-gradient-to-br from-primary to-secondary text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
      <h3 class="text-xl font-bold mb-2">${escapeHtml(user.name)}</h3>
      <p class="text-white/90 text-sm">${escapeHtml(user.email)}</p>
      <div class="mt-4 pt-2 border-t border-white/20 flex flex-col gap-1">
        <p class="text-white/70 text-[10px] font-mono break-all">ID: ${userId}</p>
        <p class="text-white/70 text-[10px]">📅 Joined: ${dateStr}</p>
      </div>
    </div>
  `}).join('');
}

// Load Posts
async function loadPosts() {
  try {
    console.log('Loading posts from:', `${API_URL}/posts`);
    const response = await fetch(`${API_URL}/posts`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    console.log('Posts loaded:', posts);
    
    // Load comments for each post
    for (let post of posts) {
      try {
        const commentsResponse = await fetch(`${API_URL}/comments/post/${post._id}`);
        if (commentsResponse.ok) {
          post.comments = await commentsResponse.json();
        } else {
          post.comments = [];
        }
      } catch (error) {
        console.error(`Error loading comments for post ${post._id}:`, error);
        post.comments = [];
      }
    }
    
    displayPosts(posts);
  } catch (error) {
    console.error('Error loading posts:', error);
    console.log('%c DIAGNOSTIC: If this is a connection error, ensure the Gateway is running on http://127.0.0.1:4000', 'color: orange; font-weight: bold;');
    document.getElementById('posts-list').innerHTML = 
      `<div class="text-center text-red-500">
        <p>❌ Error loading posts</p>
        <p class="text-sm">${error.message}</p>
      </div>`;
  }
}

function displayPosts(posts) {
  const postsList = document.getElementById('posts-list');
  
  if (!posts || posts.length === 0) {
    postsList.innerHTML = '<div class="text-center text-gray-500">No posts yet. Create one!</div>';
    return;
  }
  
  postsList.innerHTML = posts.map(post => {
    const postId = formatId(post._id);
    const dateStr = formatDate(post.createdAt);
    const userId = formatId(post.userId);

    return `
    <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-primary hover:shadow-lg transition-shadow">
      <h3 class="text-xl font-bold text-primary mb-2">${escapeHtml(post.title)}</h3>
      <p class="text-xs text-gray-500 mb-3">Posted on ${dateStr} • User ID: ${userId}</p>
      <p class="text-gray-700 mb-4">${escapeHtml(post.content)}</p>
      
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-semibold text-gray-700">💬 Comments (${post.comments?.length || 0})</h4>
          <button onclick="openCommentModal('${postId}')" class="text-sm px-3 py-1 bg-primary text-white rounded-lg hover:shadow-md transition-all">
            Add Comment
          </button>
        </div>
        ${post.comments?.length > 0 ? post.comments.map(comment => {
          const commentDateStr = formatDate(comment.createdAt);
          const commentUserId = formatId(comment.userId);
          return `
          <div class="bg-white p-3 rounded-lg mb-2 text-sm border border-gray-200">
            <p class="text-gray-700">${escapeHtml(comment.text)}</p>
            <div class="flex justify-between items-center mt-2">
              <small class="text-gray-400">User ID: ${commentUserId}</small>
              <small class="text-gray-400">${commentDateStr}</small>
            </div>
          </div>
        `}).join('') : '<p class="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>'}
      </div>
    </div>
  `}).join('');
}

// Create User
async function handleCreateUser(e) {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('user-name').value,
    email: document.getElementById('user-email').value,
    password: document.getElementById('user-password').value
  };
  
  try {
    console.log('Creating user:', data);
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('User created:', result);
      userModal.classList.add('hidden');
      userModal.classList.remove('flex');
      userForm.reset();
      loadUsers();
      showSuccess('User created successfully!');
    } else {
      const error = await response.json();
      showError('Failed to create user: ' + (error.error || error.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error creating user:', error);
    showError('Network error: ' + error.message);
  }
}

// Create Post
async function handleCreatePost(e) {
  e.preventDefault();
  
  const data = {
    title: document.getElementById('post-title').value,
    content: document.getElementById('post-content').value,
    userId: document.getElementById('post-userId').value || 'anonymous'
  };
  
  try {
    console.log('Creating post:', data);
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Post created:', result);
      postModal.classList.add('hidden');
      postModal.classList.remove('flex');
      postForm.reset();
      loadPosts();
      showSuccess('Post created successfully!');
    } else {
      const error = await response.json();
      showError('Failed to create post: ' + (error.error || error.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error creating post:', error);
    showError('Network error: ' + error.message);
  }
}

// Create Comment
async function handleCreateComment(e) {
  e.preventDefault();
  
  const data = {
    text: document.getElementById('comment-text').value,
    postId: document.getElementById('comment-postId').value,
    userId: document.getElementById('comment-userId').value || 'anonymous'
  };
  
  try {
    console.log('Creating comment:', data);
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Comment created:', result);
      commentModal.classList.add('hidden');
      commentModal.classList.remove('flex');
      commentForm.reset();
      loadPosts();
      showSuccess('Comment added successfully!');
    } else {
      const error = await response.json();
      showError('Failed to create comment: ' + (error.error || error.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    showError('Network error: ' + error.message);
  }
}

// Open Comment Modal
function openCommentModal(postId) {
  document.getElementById('comment-postId').value = postId;
  commentModal.classList.remove('hidden');
  commentModal.classList.add('flex');
}

// Utility Functions
function formatId(id) {
  if (!id) return 'anonymous';
  if (typeof id === 'object' && id.$oid) return id.$oid;
  return id;
}

function formatDate(date) {
  if (!date) return 'N/A';
  if (typeof date === 'object' && date.$date) {
    return new Date(date.$date).toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showSuccess(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  notification.textContent = '✓ ' + message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function showError(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  notification.textContent = '✗ ' + message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}
