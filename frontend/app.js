// ============================================
// SocialHub — Main Application (Tailwind)
// ============================================

const API_URL = 'http://127.0.0.1:4000/api';

// ============================================
// AUTH STATE
// ============================================
let currentUser = null;

function getStoredUser() {
  try {
    const data = localStorage.getItem('socialHub_user');
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function storeUser(user) {
  localStorage.setItem('socialHub_user', JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem('socialHub_user');
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(currentUser?.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {})
  };
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const stored = getStoredUser();
  if (stored && stored.token) {
    currentUser = stored;
    showApp();
  } else {
    showAuth();
  }
  setupAuthListeners();
  setupAppListeners();
});

// ============================================
// SCREEN SWITCHING
// ============================================
function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  stopChatPolling();
}

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  document.getElementById('nav-user-name').textContent = `Hello, ${currentUser.name}`;
  document.getElementById('create-post-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  loadPosts();
  loadSidebarUsers();
  startChatPolling();
}

// ============================================
// AUTH LISTENERS
// ============================================
function setupAuthListeners() {
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').classList.add('hidden');
    document.getElementById('register-form-container').classList.remove('hidden');
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form-container').classList.add('hidden');
    document.getElementById('login-form-container').classList.remove('hidden');
  });

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { showNotification(data.error || 'Login failed', 'error'); return; }

    currentUser = { id: data.user.id, name: data.user.name, email: data.user.email, token: data.token };
    storeUser(currentUser);
    showNotification(`Welcome back, ${currentUser.name}!`, 'success');
    showApp();
  } catch (error) {
    showNotification('Connection error: ' + error.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;

  if (password !== confirmPassword) {
    showNotification('Passwords do not match!', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) { showNotification(data.error || 'Registration failed', 'error'); return; }

    currentUser = { id: data.user.id, name: data.user.name, email: data.user.email, token: data.token };
    storeUser(currentUser);
    showNotification(`Welcome, ${currentUser.name}! Account created.`, 'success');
    showApp();
  } catch (error) {
    showNotification('Connection error: ' + error.message, 'error');
  }
}

// ============================================
// APP LISTENERS
// ============================================
function setupAppListeners() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    currentUser = null;
    clearStoredUser();
    showNotification('Signed out.', 'success');
    showAuth();
  });

  document.getElementById('open-post-modal-btn').addEventListener('click', () => {
    document.getElementById('post-modal').classList.remove('hidden');
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      if (id) document.getElementById(id).classList.add('hidden');
    });
  });

  document.getElementById('post-form').addEventListener('submit', handleCreatePost);

  // Theme Toggles (Handle multiple buttons if they exist)
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem('socialHub_theme') || 'dark';
  const isDark = savedTheme === 'dark';

  document.documentElement.classList.toggle('dark', isDark);
  updateThemeIcons(isDark);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('socialHub_theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
  const lightIcons = document.querySelectorAll('.theme-icon-light');
  const darkIcons = document.querySelectorAll('.theme-icon-dark');

  lightIcons.forEach(el => el.classList.toggle('hidden', isDark));
  darkIcons.forEach(el => el.classList.toggle('hidden', !isDark));
}

// ============================================
// CREATE POST
// ============================================
async function handleCreatePost(e) {
  e.preventDefault();
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content, userId: currentUser.id, userName: currentUser.name })
    });

    if (res.ok) {
      document.getElementById('post-modal').classList.add('hidden');
      document.getElementById('post-form').reset();
      showNotification('Post published!', 'success');
      loadPosts();
    } else {
      const data = await res.json();
      showNotification(data.error || 'Failed to create post', 'error');
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

// ============================================
// LOAD & DISPLAY POSTS (FEED)
// ============================================
let postsCache = [];

async function loadPosts() {
  const feed = document.getElementById('posts-feed');
  try {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();
    postsCache = posts;

    // Load comment counts
    for (let post of postsCache) {
      try {
        const cRes = await fetch(`${API_URL}/comments/post/${post._id}`);
        post.comments = cRes.ok ? await cRes.json() : [];
      } catch { post.comments = []; }
    }

    if (postsCache.length === 0) {
      feed.innerHTML = `
        <div class="text-center py-10 text-txt-muted">
          <span class="text-5xl block mb-3">📝</span>
          <p class="text-[15px]">No posts yet. Be the first to share something!</p>
        </div>`;
      return;
    }

    feed.innerHTML = postsCache.map(post => renderPostCard(post)).join('');
  } catch (error) {
    feed.innerHTML = `
      <div class="text-center py-10 text-txt-muted">
        <span class="text-5xl block mb-3">⚠️</span>
        <p class="text-[15px]">Failed to load posts: ${escapeHtml(error.message)}</p>
      </div>`;
  }
}

function renderPostCard(post) {
  const initial = (post.userName || 'A').charAt(0).toUpperCase();
  const author = escapeHtml(post.userName || 'Anonymous');
  const time = getTimeAgo(post.createdAt);
  const likes = post.likes ? post.likes.length : 0;
  const liked = post.likes && currentUser && post.likes.includes(currentUser.id);

  // Calculate total number of comments, including nested replies
  function countComments(comments) {
    if (!comments) return 0;
    return comments.reduce((acc, comment) => {
      return acc + 1 + countComments(comment.children);
    }, 0);
  }
  const commentCount = countComments(post.comments);

  const myInitial = currentUser ? currentUser.name.charAt(0).toUpperCase() : '?';

  // Build comment tree recursively for INLINE feed
  function renderCommentTree(comments, depth = 0) {
    if (!comments || comments.length === 0) return '';

    return comments.map(c => {
      const ci = (c.userName || 'A').charAt(0).toUpperCase();
      const cLikes = c.likes ? c.likes.length : 0;
      const cLiked = c.likes && currentUser && c.likes.includes(currentUser.id);

      // Styling adjustments for replies
      const isReply = depth > 0;
      const paddingClass = isReply ? 'ml-12 pl-4 border-l-2 border-border/50' : '';
      const mtClass = 'mt-4';
      const avatarSize = isReply ? 'w-7 h-7' : 'w-8 h-8';
      const avatarText = isReply ? 'text-[10px]' : 'text-[11px]';
      const nameText = isReply ? 'text-[11px]' : 'text-[12px]';
      const commentText = isReply ? 'text-[12px]' : 'text-[13px]';

      return `
        <div class="flex flex-col w-full ${paddingClass} ${mtClass} anim-slide-up">
          <div class="flex gap-3 w-full">
            <div class="${avatarSize} rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center ${avatarText} font-bold text-white shrink-0 shadow-sm">${ci}</div>
            <div class="flex-1 min-w-0">
              <div class="bg-surface-input rounded-2xl px-4 py-2 inline-block max-w-full shadow-sm">
                <div class="${nameText} font-bold text-brand leading-none mb-1">${escapeHtml(c.userName || 'Anonymous')}</div>
                <div class="${commentText} text-txt-primary leading-snug break-words">${escapeHtml(c.text)}</div>
              </div>
              <div class="flex items-center gap-4 mt-1.5 ml-2">
                <button onclick="event.stopPropagation(); toggleCommentLike('${post._id}', '${c._id}')" class="text-[11px] font-bold transition-colors ${cLiked ? 'text-red-400' : 'text-txt-muted hover:text-txt-primary'}">
                  ${cLiked ? '❤️' : '🤍'} ${cLikes > 0 ? cLikes : ''}
                </button>
                <button onclick="document.getElementById('reply-box-${c._id}').classList.toggle('hidden')" class="text-[11px] font-bold text-txt-muted hover:text-brand transition-colors">
                  Reply
                </button>
                <span class="text-[10px] text-txt-muted font-medium">${getTimeAgo(c.createdAt)}</span>
              </div>
              <!-- Reply Input -->
              <div id="reply-box-${c._id}" class="hidden mt-3 mb-2 flex items-center gap-2" onclick="event.stopPropagation()">
                <input type="text" id="reply-input-${c._id}" placeholder="Reply to ${escapeHtml(c.userName)}..." class="flex-1 px-3 py-1.5 bg-surface-input border border-border rounded-full text-txt-primary text-[12px] focus:outline-none focus:border-brand" onkeydown="if(event.key==='Enter')submitComment('${post._id}', '${c._id}')">
                <button onclick="event.stopPropagation(); submitComment('${post._id}', '${c._id}')" class="px-3.5 py-1.5 bg-brand text-white rounded-full text-[12px] font-bold">Reply</button>
              </div>
              <!-- Render sub-comments -->
              <div class="flex flex-col w-full">
                ${renderCommentTree(c.children, depth + 1)}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const commentsHtml = renderCommentTree(post.comments, 0);

  return `
    <div onclick="openPostDetail('${post._id}')" class="bg-surface border border-border rounded-xl p-6 hover:border-brand hover:shadow-[0_0_0_1px_var(--brand),0_4px_20px_rgba(0,0,0,0.3)] transition-all anim-slide-up cursor-pointer" data-post-id="${post._id}">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-11 h-11 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-lg font-bold text-white shrink-0">${initial}</div>
        <div class="flex-1">
          <div class="text-[15px] font-semibold">${author}</div>
          <div class="text-xs text-txt-muted">${time}</div>
        </div>
      </div>

      <!-- Content -->
      <h3 class="text-lg font-bold mb-2">${escapeHtml(post.title)}</h3>
      <p class="text-sm text-txt-secondary leading-relaxed mb-4">${escapeHtml(post.content)}</p>

      <!-- Actions -->
      <div class="flex items-center gap-2 pt-3.5 border-t border-border">
        <button onclick="event.stopPropagation(); toggleLike('${post._id}')"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] transition-all ${liked ? 'text-red-400 hover:bg-red-400/10' : 'text-txt-secondary hover:bg-brand/10 hover:text-brand-light'}">
          <span class="text-base ${liked ? 'scale-110' : ''} transition-transform">${liked ? '❤️' : '🤍'}</span>
          <span>${likes} ${likes === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <button onclick="event.stopPropagation(); toggleComments('${post._id}')"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] text-txt-secondary hover:bg-brand/10 hover:text-brand-light transition-all">
          💬 <span>${commentCount} ${commentCount === 1 ? 'Comment' : 'Comments'}</span>
        </button>
      </div>

      <!-- Comments Section -->
      <div id="comments-${post._id}" class="hidden mt-4 pt-3.5 border-t border-border" onclick="event.stopPropagation()">
        <div class="flex flex-col mb-3" id="comments-list-${post._id}">
          ${commentsHtml ? commentsHtml : '<div class="text-txt-muted text-sm text-center py-4">No comments yet.</div>'}
        </div>
        <div class="flex items-center gap-2.5 mt-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-[13px] font-bold text-white shrink-0">${myInitial}</div>
          <input type="text" id="comment-input-root-${post._id}" placeholder="Write a comment..."
                 onkeydown="if(event.key==='Enter')submitComment('${post._id}', null)"
                 class="flex-1 px-4 py-2.5 bg-surface-input border border-border rounded-full text-txt-primary text-[13px] focus:outline-none focus:border-brand placeholder:text-txt-muted transition">
          <button onclick="submitComment('${post._id}', null)"
                  class="px-4 py-2.5 bg-gradient-to-r from-brand to-brand-dark text-white rounded-full text-[13px] font-semibold hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all whitespace-nowrap">Post</button>
        </div>
      </div>
    </div>`;
}

// ============================================
// TOGGLE COMMENTS
// ============================================
function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  section.classList.toggle('hidden');
  if (!section.classList.contains('hidden')) {
    const input = document.getElementById(`comment-input-root-${postId}`);
    if (input) input.focus();
  }
}

async function submitComment(postId, parentId) {
  if (!currentUser) { showNotification('Log in to comment.', 'error'); return; }

  const isModalOpen = !document.getElementById('post-detail-modal').classList.contains('hidden');

  let input;
  if (isModalOpen) {
    input = parentId
      ? document.getElementById(`modal-reply-input-${parentId}`)
      : document.getElementById('modal-comment-input');
  } else {
    input = parentId
      ? document.getElementById(`reply-input-${parentId}`)
      : document.getElementById(`comment-input-root-${postId}`);
  }

  if (!input) { console.error("Comment input not found"); return; }
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        text,
        postId,
        userId: currentUser.id,
        userName: currentUser.name,
        parentId: parentId || null
      })
    });

    if (res.ok) {
      input.value = '';
      if (parentId) {
        const replyBox = document.getElementById(`reply-box-${parentId}`) || document.getElementById(`modal-reply-box-${parentId}`);
        if (replyBox) replyBox.classList.add('hidden');
      }
      showNotification(parentId ? 'Reply added!' : 'Comment added!', 'success');

      // Refresh post data in cache and re-render
      await refreshPost(postId);

    } else {
      const data = await res.json();
      showNotification(data.error || 'Failed to comment', 'error');
    }
  } catch (error) {
    showNotification('Connection error: ' + error.message, 'error');
  }
}

async function toggleCommentLike(postId, commentId) {
  if (!currentUser) { showNotification('Log in to like comments.', 'error'); return; }
  try {
    const res = await fetch(`${API_URL}/comments/${commentId}/like`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: currentUser.id })
    });
    if (res.ok) {
      await refreshPost(postId);
    } else {
      showNotification('Failed to like comment.', 'error');
    }
  } catch (error) {
    showNotification('Connection error: ' + error.message, 'error');
  }
}

async function toggleLike(postId) {
  if (!currentUser) { showNotification('Log in to like posts.', 'error'); return; }
  try {
    const res = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: currentUser.id })
    });
    if (res.ok) {
      await refreshPost(postId);
    } else {
      showNotification('Failed to like post.', 'error');
    }
  } catch (error) {
    showNotification('Connection error: ' + error.message, 'error');
  }
}

// ============================================
// POST DETAIL MODAL
// ============================================
async function openPostDetail(postId) {
  const modal = document.getElementById('post-detail-modal');
  const content = document.getElementById('post-detail-content');

  content.innerHTML = '<div class="text-center py-10 text-txt-muted">Loading post details...</div>';
  modal.classList.remove('hidden');

  // Fetch fresh data for the modal
  await refreshPost(postId, true);
}

function renderPostDetail(post) {
  const content = document.getElementById('post-detail-content');
  if (!post) {
    content.innerHTML = `<div class="text-center py-10 text-red-400">Error: Post not found.</div>`;
    return;
  }

  const author = escapeHtml(post.userName || 'Anonymous');
  const initial = (post.userName || 'A').charAt(0).toUpperCase();
  const liked = post.likes && currentUser && post.likes.includes(currentUser.id);
  const likes = post.likes ? post.likes.length : 0;
  const myInitial = currentUser ? currentUser.name.charAt(0).toUpperCase() : '?';

  function countComments(comments) {
    if (!comments) return 0;
    return comments.reduce((acc, comment) => {
      return acc + 1 + countComments(comment.children);
    }, 0);
  }
  const commentCount = countComments(post.comments);

  // Reuse the tree logic for the modal
  function renderModalCommentTree(comments, depth = 0) {
    if (!comments || comments.length === 0) return '';

    return comments.map(c => {
      const ci = (c.userName || 'A').charAt(0).toUpperCase();
      const cLikes = c.likes ? c.likes.length : 0;
      const cLiked = c.likes && currentUser && c.likes.includes(currentUser.id);

      // Styling adjustments for replies
      const isReply = depth > 0;
      const paddingClass = isReply ? 'ml-12 pl-4 border-l-2 border-border/50' : '';
      const mtClass = 'mt-4';
      const avatarSize = isReply ? 'w-7 h-7' : 'w-8 h-8';
      const avatarText = isReply ? 'text-[10px]' : 'text-[11px]';
      const nameText = isReply ? 'text-[11px]' : 'text-[12px]';
      const commentText = isReply ? 'text-[12px]' : 'text-[13px]';

      return `
        <div class="flex flex-col w-full ${paddingClass} ${mtClass}">
          <div class="flex gap-3 w-full">
            <div class="${avatarSize} rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center ${avatarText} font-bold text-white shrink-0 shadow-sm">${ci}</div>
            <div class="flex-1 min-w-0">
              <div class="bg-surface-input rounded-2xl px-4 py-2 inline-block max-w-full shadow-sm">
                <div class="${nameText} font-bold text-brand leading-none mb-1">${escapeHtml(c.userName || 'Anonymous')}</div>
                <div class="${commentText} text-txt-primary leading-snug break-words">${escapeHtml(c.text)}</div>
              </div>
              <div class="flex items-center gap-4 mt-1.5 ml-2">
                <button onclick="toggleCommentLike('${post._id}', '${c._id}')" class="text-[11px] font-bold transition-colors ${cLiked ? 'text-red-400' : 'text-txt-muted hover:text-txt-primary'}">
                  ${cLiked ? '❤️' : '🤍'} ${cLikes > 0 ? cLikes : ''}
                </button>
                <button onclick="document.getElementById('modal-reply-box-${c._id}').classList.toggle('hidden')" class="text-[11px] font-bold text-txt-muted hover:text-brand transition-colors">
                  Reply
                </button>
                <span class="text-[10px] text-txt-muted font-medium">${getTimeAgo(c.createdAt)}</span>
              </div>
              <!-- Modal Reply Input -->
              <div id="modal-reply-box-${c._id}" class="hidden mt-3 flex items-center gap-2">
                <input type="text" id="modal-reply-input-${c._id}" placeholder="Reply to ${escapeHtml(c.userName)}..." class="flex-1 px-4 py-2 bg-surface-input border border-border rounded-full text-txt-primary text-[13px] focus:outline-none focus:border-brand" onkeydown="if(event.key==='Enter')submitComment('${post._id}', '${c._id}')">
                <button onclick="submitComment('${post._id}', '${c._id}')" class="px-3.5 py-1.5 bg-brand text-white rounded-full text-[12px] font-bold">Reply</button>
              </div>
              <div class="flex flex-col w-full">
                ${renderModalCommentTree(c.children, depth + 1)}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const commentsHtml = renderModalCommentTree(post.comments, 0);

  content.innerHTML = `
    <div class="mb-8 p-1">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-xl font-bold text-white shrink-0">${initial}</div>
        <div>
          <div class="text-[17px] font-bold">${author}</div>
          <div class="text-xs text-txt-muted">${getTimeAgo(post.createdAt)}</div>
        </div>
      </div>
      <h1 class="text-2xl font-extrabold mb-4 leading-tight">${escapeHtml(post.title)}</h1>
      <p class="text-[16px] text-txt-secondary leading-relaxed mb-8 whitespace-pre-wrap">${escapeHtml(post.content)}</p>
      
      <div class="flex items-center gap-5 py-5 border-y border-border">
        <button onclick="toggleLike('${post._id}')" class="flex items-center gap-2 font-bold text-[15px] ${liked ? 'text-red-400' : 'text-txt-muted hover:text-txt-primary'} transition-colors">
          ${liked ? '❤️' : '🤍'} ${likes} Likes
        </button>
        <span class="text-txt-muted font-bold text-[15px]">💬 ${commentCount} <span class="hidden sm:inline">Comments</span></span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <h3 class="font-bold text-[16px] mb-6 flex items-center gap-2">
        <span>Discussion</span>
        <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
      </h3>
      <div class="flex flex-col gap-6 mb-10">
        ${commentsHtml || '<div class="text-center py-12 text-txt-muted text-sm italic">Be the first to share your thoughts.</div>'}
      </div>
    </div>

    <div class="sticky bottom-0 bg-surface/90 backdrop-blur-md pt-6 pb-2 mt-auto border-t border-border flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-sm font-bold text-white shrink-0">${myInitial}</div>
        <div class="flex-1 relative">
          <input type="text" id="modal-comment-input" data-post-id="${post._id}" placeholder="Add a comment..." 
                 class="w-full px-5 py-3 bg-surface-input border border-border rounded-full text-[14px] focus:outline-none focus:border-brand pr-16 transition-all" 
                 onkeydown="if(event.key==='Enter')submitComment('${post._id}', null)">
          <button onclick="submitComment('${post._id}', null)"
                  class="absolute right-2 top-1.5 px-4 py-1.5 bg-brand text-white rounded-full font-bold text-[12px] hover:shadow-brand/20 shadow-md transition-all">Post</button>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// DATA REFRESH & SYNC
// ============================================
async function refreshPost(postId, renderModal = false) {
  try {
    // Find the post in cache
    const postIndex = postsCache.findIndex(p => p._id === postId);
    if (postIndex === -1) {
      console.error("Post not in cache.");
      await loadPosts(); // Fallback to full reload
      return;
    }
    let post = postsCache[postIndex];

    // Fetch fresh comments for that post
    const cRes = await fetch(`${API_URL}/comments/post/${postId}`);
    if (cRes.ok) {
      post.comments = await cRes.json();
    }

    // Fetch fresh post data (for likes)
    const pRes = await fetch(`${API_URL}/posts/${postId}`);
    if (pRes.ok) {
      const updatedPost = await pRes.json();
      post.likes = updatedPost.likes;
    }

    // Update the cache
    postsCache[postIndex] = post;

    // Re-render the card in the feed
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    if (postCard) {
      postCard.outerHTML = renderPostCard(post);
    }

    // If the modal is open for this post, re-render it too
    const isModalOpen = !document.getElementById('post-detail-modal').classList.contains('hidden');
    const modalPostId = document.getElementById('modal-comment-input')?.getAttribute('data-post-id');

    if (renderModal || (isModalOpen && modalPostId === postId)) {
      renderPostDetail(post);
    }
  } catch (error) {
    console.error("Failed to refresh post:", error);
    showNotification('Could not update post.', 'error');
  }
}

// ============================================
// SIDEBAR — USERS
// ============================================
async function loadSidebarUsers() {
  const list = document.getElementById('users-sidebar-list');
  try {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users = await res.json();

    if (users.length === 0) return;

    list.innerHTML = users.map(user => {
      const initial = (user.name || '?').charAt(0).toUpperCase();
      const isCurrent = currentUser && user._id === currentUser.id;
      return `
        <div onclick="${isCurrent ? '' : `openChat('${user._id}', '${user.name.replace(/'/g, "\\'")}')`}" class="flex items-center gap-2.5 py-2.5 px-3 rounded-lg hover:bg-surface-hover transition ${isCurrent ? 'cursor-default' : 'cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] pointer-events-auto'}">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-[13px] font-bold text-white shrink-0">${initial}</div>
          <div class="min-w-0">
            <div class="text-sm font-medium truncate">${escapeHtml(user.name)}${isCurrent ? ' <span class="text-brand-light text-xs">(you)</span>' : ''}</div>
            <div class="text-[11px] text-txt-muted truncate">${escapeHtml(user.email)}</div>
          </div>
          <div class="w-2 h-2 rounded-full bg-emerald-400 ml-auto shrink-0"></div>
        </div>`;
    }).join('');
  } catch (error) {
    list.innerHTML = '<div class="text-center text-red-400 py-3 text-[13px]">Failed to load users</div>';
  }
}

// ============================================
// MULTI-CHAT FUNCTIONALITY
// ============================================
let activeChats = []; // Array of { userId, userName }
let chatPollInterval = null;

function openChat(userId, userName) {
  if (!currentUser || userId === currentUser.id) return;
  // If already open, do nothing
  if (!activeChats.find(c => c.userId === userId)) {
    activeChats.push({ userId, userName });
    renderChats();
  }
}

function closeChat(userId) {
  activeChats = activeChats.filter(c => c.userId !== userId);
  renderChats();
}

function renderChats() {
  const container = document.getElementById('chat-container');
  container.innerHTML = activeChats.map(chat => `
    <div class="w-[300px] h-[400px] bg-surface border border-border rounded-t-xl shadow-[0_-8px_20px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto anim-slide-up">
      <!-- Chat Header -->
      <div class="flex items-center justify-between p-3 border-b border-border bg-gradient-to-r from-surface to-surface-hover rounded-t-xl">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-xs font-bold text-white shrink-0">${chat.userName.charAt(0).toUpperCase()}</div>
          <div>
            <h3 class="font-bold text-[13px] leading-tight flex items-center gap-1.5">${escapeHtml(chat.userName)} <span class="w-2 h-2 rounded-full bg-emerald-400"></span></h3>
          </div>
        </div>
        <button onclick="closeChat('${chat.userId}')" class="text-txt-muted hover:text-white transition text-xl px-1">&times;</button>
      </div>
      <!-- Messages -->
      <div id="chat-msgs-${chat.userId}" class="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-surface-dark/40">
        <div class="text-center text-txt-muted text-[11px] py-4">Loading...</div>
      </div>
      <!-- Input -->
      <form onsubmit="event.preventDefault(); submitChatMessage('${chat.userId}')" class="p-3 border-t border-border bg-surface flex items-center gap-2">
        <input type="text" id="chat-input-${chat.userId}" placeholder="Message..." autocomplete="off" class="flex-1 px-3 py-2 bg-surface-input border border-border rounded-lg text-txt-primary text-[12px] focus:outline-none focus:border-brand transition">
        <button type="submit" class="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-lg hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all flex-shrink-0">➤</button>
      </form>
    </div>
  `).join('');

  // instantly fetch messages
  pollChats();
}

async function submitChatMessage(receiverId) {
  if (!currentUser) return;
  const input = document.getElementById(`chat-input-${receiverId}`);
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ senderId: currentUser.id, receiverId, text })
    });
    if (res.ok) {
      input.value = '';
      pollChatForUser(receiverId); // instant update
    }
  } catch (e) {
    showNotification('Error sending message', 'error');
  }
}

function startChatPolling() {
  if (!chatPollInterval) {
    chatPollInterval = setInterval(pollChats, 3000);
  }
}

function stopChatPolling() {
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
    chatPollInterval = null;
  }
}

function pollChats() {
  activeChats.forEach(chat => pollChatForUser(chat.userId));
}

async function pollChatForUser(otherUserId) {
  if (!currentUser) return;
  const msgsContainer = document.getElementById(`chat-msgs-${otherUserId}`);
  if (!msgsContainer) return;

  try {
    const res = await fetch(`${API_URL}/chat/${currentUser.id}/${otherUserId}`);
    if (!res.ok) return;
    const messages = await res.json();

    if (messages.length === 0) {
      if (msgsContainer.innerHTML.includes('Loading')) {
        msgsContainer.innerHTML = '<div class="text-center text-txt-muted text-[11px] py-4">No messages yet. Say hi!</div>';
      }
      return;
    }

    const html = messages.map(msg => {
      const isMine = msg.senderId === currentUser.id;
      return `
        <div class="flex flex-col ${isMine ? 'items-end' : 'items-start'}">
          <div class="max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${isMine ? 'bg-gradient-to-br from-brand to-brand-dark text-white rounded-br-sm' : 'bg-surface-input border border-border text-txt-primary rounded-bl-sm'}">
            ${escapeHtml(msg.text)}
          </div>
        </div>`;
    }).join('');

    // Update if different to minimize layout shifts
    if (msgsContainer.innerHTML !== html) {
      const isAtBottom = msgsContainer.scrollHeight - msgsContainer.scrollTop <= msgsContainer.clientHeight + 20;
      msgsContainer.innerHTML = html;
      if (isAtBottom) msgsContainer.scrollTop = msgsContainer.scrollHeight;
    }
  } catch (e) { }
}


// ============================================
// UTILITIES
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const s = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function showNotification(message, type = 'success') {
  const container = document.getElementById('notification-container');
  const el = document.createElement('div');
  const bg = type === 'success'
    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    : 'bg-gradient-to-r from-red-500 to-orange-500';
  el.className = `px-5 py-3.5 rounded-lg text-sm font-medium text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] min-w-[260px] anim-notify ${bg}`;
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('anim-notify-out');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}
