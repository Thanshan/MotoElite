/**
 * booking.js — Bike Booking Form
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadBikeOptions();
  setMinDate();
  setupForm();
  preselectBike();
});

async function loadBikeOptions() {
  const select = document.getElementById('bikeId');
  try {
    const data = await apiGet('/bikes?comingSoon=false&available=true&limit=50');
    select.innerHTML = '<option value="">— Select a Bike —</option>';
    data.bikes.forEach(bike => {
      const opt = document.createElement('option');
      opt.value = bike._id;
      opt.textContent = `${bike.brand} ${bike.modelName} — ${formatPrice(bike.price)}`;
      select.appendChild(opt);
    });
  } catch (e) {
    select.innerHTML = '<option value="">Error loading bikes</option>';
  }
}

function setMinDate() {
  const dateInput = document.getElementById('preferredDate');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

function preselectBike() {
  const params = new URLSearchParams(window.location.search);
  const bikeId = params.get('bike');
  if (bikeId) {
    const select = document.getElementById('bikeId');
    // Retry after bikes load
    setTimeout(() => {
      select.value = bikeId;
    }, 600);
  }
}

function setupForm() {
  const form = document.getElementById('booking-form');
  const submitBtn = document.getElementById('submit-booking-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate
    const fields = ['customerName', 'phone', 'email', 'address', 'bikeId', 'preferredDate'];
    let valid = true;

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.style.borderColor = 'var(--accent-red)';
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });

    if (!valid) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    // Validate email
    const emailEl = document.getElementById('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.style.borderColor = 'var(--accent-red)';
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Submitting...';

    try {
      const bookingData = {
        customerName: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        bikeId: document.getElementById('bikeId').value,
        preferredDate: document.getElementById('preferredDate').value,
        notes: document.getElementById('notes').value.trim(),
      };

      const result = await apiPost('/bookings', bookingData);

      // Show success
      form.style.display = 'none';
      const successDiv = document.getElementById('booking-success');
      successDiv.style.display = 'block';
      document.getElementById('booking-id').textContent = result.booking._id;

      showToast('Booking submitted successfully! 🎉', 'success');
    } catch (err) {
      showToast(err.message || 'Booking failed. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🏍️ Submit Booking Request';
    }
  });

  // Clear error styling on input
  document.querySelectorAll('.form-control').forEach(el => {
    el.addEventListener('input', () => {
      el.style.borderColor = '';
    });
  });
}
