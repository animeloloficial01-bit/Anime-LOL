const API_BASE = 'https://api.jikan.moe/v4';

async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    return await res.json();
  } catch (e) { console.error(e); }
}

function renderGrid(container, data) {
  container.innerHTML = '';
  data?.data.slice(0, 12).forEach((anime, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${anime.images?.jpg?.image_url || 'https://via.placeholder.com/250x350?text=Anime'}" alt="${anime.title}" loading="lazy">
      <h3>${anime.title}</h3>
      <p>${anime.status || 'Airings'}</p>
    `;
    container.appendChild(card);
    anime({
      targets: card,
      opacity: [0,1],
      translateY: [50,0],
      scale: [0.9,1],
      duration: 1000,
      delay: i * 100,
      easing: 'easeOutExpo'
    });
  });
}

async function loadTrends(type = 'airing') {
  const data = await fetchData(`/top/anime?type=${type}`);
  renderGrid(document.getElementById('trendsList'), data);
}

document.getElementById('searchInput').addEventListener('input', async (e) => {
  if (e.target.value.length > 2) {
    const data = await fetchData(`/anime?q=${encodeURIComponent(e.target.value)}`);
    renderGrid(document.getElementById('searchList'), data);
  } else {
    document.getElementById('searchList').innerHTML = '';
  }
});

async function loadWeekly(day) {
  const data = await fetchData(`/schedules?filter=${day.toLowerCase()}`);
  renderGrid(document.getElementById('weeklyList'), data);
}

async function loadMonthly() {
  const data = await fetchData('/seasons/now');
  renderGrid(document.getElementById('monthlyList'), data);
}

// Navbar Mobile
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  anime({targets: '.bar', rotate: navMenu.classList.contains('active') ? 45 : 0, duration: 300});
});

// Dark Mode
document.getElementById('darkToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute('href')).scrollIntoView({behavior: 'smooth'});
  });
});

// Init
loadTrends();
loadWeekly('Monday');
loadMonthly();

// Sidebar toggle on mobile (opcional)
window.addEventListener('resize', () => {
  if (window.innerWidth > 768px) document.getElementById('sidebar').classList.remove('open');
});
