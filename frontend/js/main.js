/**
 * main.js — Global JavaScript
 * Handles: Navbar, scroll reveal, toast, loading, counters, footer
 */

const API_BASE = 'http://localhost:5000/api';

/* ─── DOM Ready ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initPageTransition();
  setActiveNavLink();
});

/* ─── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  // Scroll handler
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }
}

/* ─── Active Nav Link ────────────────────────────────────── */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ─── Scroll Reveal ──────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

/* ─── Page Transition ────────────────────────────────────── */
function initPageTransition() {
  const content = document.querySelector('.page-content');
  if (content) {
    content.style.animation = 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}

/* ─── Toast Notifications ────────────────────────────────── */
function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `
    <span>${icons[type] || '📢'}</span>
    <span>${message}</span>
  `;
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ─── Animated Counter ───────────────────────────────────── */
function animateCounter(el, target, duration = 2000, suffix = '') {
  let start = 0;
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const value = Math.floor(eased * target);

    el.textContent = value.toLocaleString() + suffix;

    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

/* ─── Observe and trigger counters ──────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ─── API Helper ─────────────────────────────────────────── */
async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiPost(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiPostForm(endpoint, formData) {
  const token = localStorage.getItem('adminToken');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiPut(endpoint, body) {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiDelete(endpoint) {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/* ─── Format currency ────────────────────────────────────── */
function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}

/* ─── Format date ────────────────────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

/* ─── Bike image URL helper ──────────────────────────────── */
function bikeImgUrl(filename) {
  if (!filename) return 'images/bike-placeholder.jpg';
  if (filename.startsWith('http')) return filename;
  return `http://localhost:5000/uploads/${filename}`;
}

/* ─── Loading overlay ────────────────────────────────────── */
function showLoading(container, message = 'Loading...') {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem;gap:1rem;">
      <div class="spinner"></div>
      <p style="color:var(--text-muted);font-size:0.9rem;">${message}</p>
    </div>
  `;
}

/* ─── Navbar HTML (injected if not present) ──────────────── */
function injectNavbar() {
  if (document.querySelector('.navbar')) return;
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = navbarHTML;
  document.body.prepend(nav);
  initNavbar();
  setActiveNavLink();
}

const navbarHTML = `
  <div class="nav-container">
    <a href="index.html" class="nav-logo">
      <div class="nav-logo-icon">🏍️</div>
      <div>
        <span class="nav-logo-text">MotoElite</span>
        <span class="nav-logo-sub">Premium Showroom</span>
      </div>
    </a>
    <ul class="nav-links" id="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="bikes.html">Available Bikes</a></li>
      <li><a href="coming-soon.html">Coming Soon</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="booking.html">Bike Booking</a></li>
      <li><a href="about.html">About Us</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <div class="nav-cta">
      <a href="booking.html" class="nav-book-btn">Book Now</a>
    </div>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </div>
`;

const footerHTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo-text">🏍️ MotoElite</div>
        <p style="font-size:0.9rem;color:var(--text-muted);max-width:280px;">
          Premium motorbike showroom offering the finest selection of motorcycles with world-class service and expertise.
        </p>
      </div>
      <div>
        <div class="footer-heading">Quick Links</div>
        <ul class="footer-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="bikes.html">Available Bikes</a></li>
          <li><a href="coming-soon.html">Coming Soon</a></li>
          <li><a href="booking.html">Book a Bike</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-heading">Services</div>
        <ul class="footer-links">
          <li><a href="services.html">General Service</a></li>
          <li><a href="services.html">Oil Change</a></li>
          <li><a href="services.html">Engine Repair</a></li>
          <li><a href="services.html">Full Inspection</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-heading">Contact</div>
        <ul class="footer-links">
          <li><a href="tel:+919876543210">+91 98765 43210</a></li>
          <li><a href="mailto:info@motoelite.in">info@motoelite.in</a></li>
          <li><a href="contact.html">Find Us</a></li>
          <li><a href="about.html">About Us</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2024 MotoElite Premium Showroom. All rights reserved.</span>
      <a href="admin/login.html" style="color:var(--text-muted);font-size:0.8rem;">Admin</a>
    </div>
  </div>
</footer>
`;

/* Expose globals */
window.showToast = showToast;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.bikeImgUrl = bikeImgUrl;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPostForm = apiPostForm;
window.apiPut = apiPut;
window.apiDelete = apiDelete;
window.showLoading = showLoading;
window.initCounters = initCounters;
window.navbarHTML = navbarHTML;
window.footerHTML = footerHTML;
window.API_BASE = API_BASE;
