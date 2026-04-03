// DefenceTrack - Main JS

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Auto-dismiss alerts
document.querySelectorAll('.alert').forEach(alert => {
  setTimeout(() => {
    alert.style.transition = 'opacity 0.5s';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  }, 5000);
});

// Animate stat values on page load
document.querySelectorAll('.stat-value').forEach(el => {
  const target = parseInt(el.textContent, 10);
  if (isNaN(target) || target === 0) return;
  let current = 0;
  const increment = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
});

// Animate bar fills
document.querySelectorAll('.bar-fill').forEach(bar => {
  const width = bar.style.width;
  bar.style.width = '0%';
  setTimeout(() => { bar.style.width = width; }, 100);
});

// Confirm delete
document.querySelectorAll('[data-confirm]').forEach(el => {
  el.addEventListener('submit', (e) => {
    if (!confirm(el.dataset.confirm)) e.preventDefault();
  });
});
