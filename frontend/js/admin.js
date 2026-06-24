/**
 * admin.js — Shared Admin Utilities
 * Handles: auth guard, sidebar, topbar, API calls with auth headers
 */

const API_BASE = 'http://localhost:5000/api';

/* ─── Auth Guard ─────────────────────────────────────────────── */
function requireAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }
  return token;
}

function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem('adminUser')) || {};
  } catch {
    return {};
  }
}

function adminLogout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = 'login.html';
}

/* ─── Authenticated API Helpers ──────────────────────────────── */
async function adminGet(endpoint) {
  const token = requireAuth();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) { adminLogout(); return; }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function adminPost(endpoint, body) {
  const token = requireAuth();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) { adminLogout(); return; }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function adminPostForm(endpoint, formData) {
  const token = requireAuth();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) { adminLogout(); return; }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function adminPut(endpoint, body) {
  const token = requireAuth();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) { adminLogout(); return; }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function adminPutForm(endpoint, formData) {
  const token = requireAuth();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) { adminLogout(); return; }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function adminDelete(endpoint) {
  const token = requireAuth();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) { adminLogout(); return; }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

/* ─── Toast Notification ─────────────────────────────────────── */
function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `
    <span>${icons[type] || '📢'}</span>
    <span>${message}</span>
  `;
  toast.style.cssText = 'display:flex;align-items:center;gap:10px;';
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ─── Format Helpers ─────────────────────────────────────────── */
function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function bikeImgUrl(filename) {
  if (!filename) return '../images/bike-placeholder.jpg';
  if (filename.startsWith('http')) return filename;
  return `http://localhost:5000/uploads/${filename}`;
}

/* ─── Sidebar Initialization ─────────────────────────────────── */
function initAdminSidebar() {
  const user = getAdminUser();
  const page = window.location.pathname.split('/').pop();

  // Set user info
  const avatarEl   = document.getElementById('sidebar-avatar');
  const usernameEl = document.getElementById('sidebar-username');
  const roleEl     = document.getElementById('sidebar-role');

  const displayUsername = user.name || user.username || 'Admin';
  if (avatarEl && displayUsername) {
    avatarEl.textContent = displayUsername.charAt(0).toUpperCase();
  }
  if (usernameEl) usernameEl.textContent = displayUsername;
  if (roleEl) roleEl.textContent = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Administrator';

  // Set active sidebar link
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(page)) {
      link.classList.add('active');
    }
  });

  // Logout button
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        adminLogout();
      }
    });
  }

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar   = document.getElementById('admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

/* ─── Modal Helpers ──────────────────────────────────────────── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* Close modals on overlay click */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ─── Status Badge Helper ────────────────────────────────────── */
function statusBadge(status) {
  const map = {
    pending:   { cls: 'badge-coming-soon', label: 'Pending' },
    confirmed: { cls: 'badge-available',   label: 'Confirmed' },
    completed: { cls: 'badge-available',   label: 'Completed' },
    cancelled: { cls: 'badge-unavailable', label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'badge-coming-soon', label: status };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

/* ─── Loading HTML ───────────────────────────────────────────── */
function tableLoadingRows(cols = 6) {
  return Array(5).fill('').map(() => `
    <tr>
      ${Array(cols).fill('').map(() => `
        <td><div style="height:14px;background:rgba(255,255,255,0.05);border-radius:4px;animation:pulse 1.5s ease-in-out infinite;"></div></td>
      `).join('')}
    </tr>
  `).join('');
}

const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes slideOutRight {
    to { transform: translateX(120%); opacity: 0; }
  }
`;
document.head.appendChild(pulseStyle);

/* ─── Expose globals ─────────────────────────────────────────── */
window.API_BASE           = API_BASE;
window.requireAuth        = requireAuth;
window.getAdminUser       = getAdminUser;
window.adminLogout        = adminLogout;
window.adminGet           = adminGet;
window.adminPost          = adminPost;
window.adminPostForm      = adminPostForm;
window.adminPut           = adminPut;
window.adminPutForm       = adminPutForm;
window.adminDelete        = adminDelete;
window.showToast          = showToast;
window.formatPrice        = formatPrice;
window.formatDate         = formatDate;
window.bikeImgUrl         = bikeImgUrl;
window.initAdminSidebar   = initAdminSidebar;
window.openModal          = openModal;
window.closeModal         = closeModal;
window.statusBadge        = statusBadge;
window.tableLoadingRows   = tableLoadingRows;
