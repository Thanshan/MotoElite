/**
 * bikes.js — Available Bikes Page
 */
let currentPage = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', () => {
  loadBrands();
  loadBikes();
  setupFilters();
});

async function loadBrands() {
  try {
    const data = await apiGet('/bikes/brands');
    const select = document.getElementById('brand-filter');
    data.brands.forEach(brand => {
      const opt = document.createElement('option');
      opt.value = brand;
      opt.textContent = brand;
      select.appendChild(opt);
    });
  } catch (e) {}
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const brandFilter = document.getElementById('brand-filter');
  const categoryFilter = document.getElementById('category-filter');
  const availFilter = document.getElementById('availability-filter');
  const resetBtn = document.getElementById('reset-filters');

  let searchTimeout;

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = searchInput.value;
      currentPage = 1;
      loadBikes();
    }, 400);
  });

  brandFilter.addEventListener('change', () => {
    currentFilters.brand = brandFilter.value;
    currentPage = 1;
    loadBikes();
  });

  categoryFilter.addEventListener('change', () => {
    currentFilters.category = categoryFilter.value;
    currentPage = 1;
    loadBikes();
  });

  availFilter.addEventListener('change', () => {
    currentFilters.available = availFilter.value;
    currentPage = 1;
    loadBikes();
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    brandFilter.value = '';
    categoryFilter.value = '';
    availFilter.value = '';
    currentFilters = {};
    currentPage = 1;
    loadBikes();
  });
}

async function loadBikes() {
  const grid = document.getElementById('bikes-grid');
  showLoading(grid, 'Loading bikes...');

  const params = new URLSearchParams({
    page: currentPage,
    limit: 25,
    comingSoon: false,
    ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v !== '')),
  });

  try {
    const data = await apiGet(`/bikes?${params}`);
    renderBikes(data.bikes, data.total);
    renderPagination(data.pages, data.currentPage);
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">🏍️</div>
        <h3>Unable to load bikes</h3>
        <p>Make sure the backend server is running on port 5000.</p>
      </div>
    `;
    document.getElementById('filter-results').textContent = '';
  }
}

function renderBikes(bikes, total) {
  const grid = document.getElementById('bikes-grid');
  document.getElementById('filter-results').textContent = `${total} bike${total !== 1 ? 's' : ''} found`;

  if (!bikes.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">🔍</div>
        <h3>No bikes found</h3>
        <p>Try adjusting your search or filters.</p>
        <button class="btn btn-secondary" onclick="document.getElementById('reset-filters').click()" style="margin-top:1rem;">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = bikes.map(bike => `
    <div class="bike-card reveal visible">
      <div class="bike-card-image">
        <img src="${bikeImgUrl(bike.image)}" alt="${bike.modelName}"
          onerror="this.src='images/bike-placeholder.jpg'" loading="lazy" />
        <div class="bike-card-image-overlay"></div>
        <div class="bike-card-badge">
          <span class="badge ${bike.availability ? 'badge-available' : 'badge-unavailable'}">
            ${bike.availability ? '● Available' : '● Sold Out'}
          </span>
        </div>
      </div>
      <div class="bike-card-body">
        <div class="bike-card-brand">${bike.brand}</div>
        <h3 class="bike-card-name">${bike.modelName}</h3>
        <div class="bike-card-specs">
          <div class="bike-spec">
            <span class="bike-spec-icon">⚙️</span>
            <span>${bike.engineCapacity}</span>
          </div>
          <div class="bike-spec">
            <span class="bike-spec-icon">🏷️</span>
            <span>${bike.category || 'Sport'}</span>
          </div>
          ${bike.specifications && bike.specifications.topSpeed ? `
          <div class="bike-spec">
            <span class="bike-spec-icon">🚀</span>
            <span>${bike.specifications.topSpeed}</span>
          </div>` : ''}
        </div>
        <div class="bike-card-price">${formatPrice(bike.price)}</div>
        <div class="bike-card-actions">
          <a href="bike-detail.html?id=${bike._id}" class="btn btn-secondary btn-sm" id="detail-${bike._id}">View Details</a>
          <a href="booking.html?bike=${bike._id}" class="btn btn-primary btn-sm" id="book-${bike._id}">Book Now</a>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPagination(totalPages, current) {
  const container = document.getElementById('pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (current > 1) {
    html += `<button onclick="changePage(${current - 1})">‹</button>`;
  }
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  if (current < totalPages) {
    html += `<button onclick="changePage(${current + 1})">›</button>`;
  }
  container.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  loadBikes();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
