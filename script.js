// Estado global
let currentUser = null;
let currentTab = 'welcome';
let animeData = [];
let trendsData = [];

// Datos de prueba (se actualizan con IA + Supabase)
const sampleCalendar = {
    week: {
        lunes: [{title: 'One Piece', time: '21:30', progress: 65}],
        martes: [{title: 'Jujutsu Kaisen', time: '22:00', progress: 85}],
        miercoles: [{title: 'Solo Leveling', time: '20:45', progress: 40}],
        jueves: [{title: 'Frieren', time: '21:15', progress: 92}],
        viernes: [{title: 'Kaiju No. 8', time: '23:00', progress: 15}],
        sabado: [{title: 'Wind Breaker', time: '20:30', progress: 78}],
        domingo: [{title: 'Blue Archive', time: '22:15', progress: 33}]
    }
};

const sampleTrends = [
    {title: 'Solo Leveling rompe récords', category: 'noticia'},
    {title: 'Frieren gana Anime of the Year', category: 'noticia'},
    {title: 'JJK S2: El mejor arco animado', category: 'analisis'}
];

// Inicialización
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    await import('./supabase.js');
    await import('./gemini.js');
    
    setupEventListeners();
    checkUserSession();
    loadMatchOfDay();
    setInterval(updateTrends, 24*60*60*1000); // 24h
    updateTrends();
    
    // Animaciones iniciales
    document.body.classList.add('animate-fade-in');
}

function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Chat IA
    document.getElementById('chatToggle').addEventListener('click', toggleChat);
    document.getElementById('closeChat').addEventListener('click', toggleChat);
    document.getElementById('sendMessage').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('submitPin').addEventListener('click', handleLogin);
    document.getElementById('pinInput').addEventListener('input', (e) => {
        e.target.style.letterSpacing = '0.2em';
    });

    // Funciones principales
    document.getElementById('matchDayBtn').addEventListener('click', loadMatchOfDay);
    document.getElementById('syncBtn').addEventListener('click', mysticRefresh);
    document.getElementById('unlockForum').addEventListener('click', showLoginModal);
    document.getElementById('weekView').addEventListener('click', () => showCalendarView('week'));
    document.getElementById('monthView').addEventListener('click', () => showCalendarView('month'));
}

function switchTab(tabName) {
    if (currentTab === tabName) return;
    
    // Ocultar actual
    document.getElementById(currentTab).classList.add('hidden');
    document.querySelector(`[data-tab="${currentTab}"]`).classList.remove('tab-active');
    
    // Mostrar nuevo
    currentTab = tabName;
    document.getElementById(tabName).classList.remove('hidden');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('tab-active');
    
    // Cargar contenido específico
    if (tabName === 'calendar') renderCalendar();
    if (tabName === 'trends') renderTrends();
    if (tabName === 'forum') checkForumAccess();
}

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggle = document.getElementById('chatToggle');
    chat.classList.toggle('hidden');
    toggle.style.display = chat.classList.contains('hidden') ? 'flex' : 'none';
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Mensaje usuario
    addChatMessage(message, 'user');
    input.value = '';
    
    // Respuesta IA
    const response = await chatWithGatoNocturno(message, {tab: currentTab});
    setTimeout(() => addChatMessage(response, 'bot'), 800);
    
    // Procesar comandos
    processCommand(message.toLowerCase());
}

function addChatMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = sender === 'user' 
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl ml-auto max-w-xs animate-slide-in-right'
        : 'bg-purple-600/50 p-4 rounded-2xl max-w-xs animate-slide-in-left';
    
    div.innerHTML = sender === 'user' 
        ? `<div class="font-semibold mb-1">Tú</div>${text}`
        : `<div class="font-semibold mb-1">GatoNocturno 🐾✨</div>${text}`;
    
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function processCommand(cmd) {
    if (cmd.startsWith('/filtrar')) {
        const genre = cmd.split(' ')[1];
        filterContent(genre);
    }
    if (cmd.startsWith('/resumen')) {
        const anime = cmd.split(' ').slice(1).join(' ');
        showAnimeSummary(anime);
    }
}

async function handleLogin() {
    const pin = document.getElementById('pinInput').value;
    if (pin.length < 4) return alert('Clave debe tener 4-8 dígitos');
    
    const result = await loginUser(pin);
    if (result.success) {
        currentUser = result.user;
        updateUIForUser();
        document.getElementById('loginModal').classList.add('hidden');
    } else {
        alert('Error en login');
    }
}

function updateUIForUser() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('userPanelBtn').classList.remove('hidden');
    document.getElementById('forumBtn').classList.remove('grayscale');
}

async function loadMatchOfDay() {
    const match = await getMatchOfDay();
    const btn = document.getElementById('matchDayBtn');
    btn.innerHTML = `✨ ${match.titulo} ✨<br><span class="text-sm">${match.por_que_te_encantara}</span>`;
    btn.classList.add('animate-bounce');
    setTimeout(() => btn.classList.remove('animate-bounce'), 2000);
}

async function mysticRefresh() {
    const btn = document.getElementById('syncBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Actualizando...';
    btn.disabled = true;
    
    await updateTrends();
    await renderCalendar();
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-sync-alt mr-3 animate-spin-slow"></i>Refresco Místico';
        btn.disabled = false;
        btn.classList.add('animate-pulse');
        setTimeout(() => btn.classList.remove('animate-pulse'), 1000);
    }, 1500);
}

function renderCalendar() {
    const container = document.getElementById('calendarContent');
    container.innerHTML = '';
    
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    days.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'bg-black/50 backdrop-blur-md rounded-3xl p-6 border border-purple-500/30 hover:scale-105 transition-all duration-500 anime-card';
        dayDiv.innerHTML = `
            <h3 class="font-black text-xl mb-4 text-purple-400">${day.charAt(0).toUpperCase() + day.slice(1)}</h3>
            <div class="space-y-3">
                ${sampleCalendar.week[day].map(anime => `
                    <div class="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl hover:bg-purple-500/30 transition-all duration-300 group">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold">${anime.title}</span>
                            <span class="text-sm text-purple-300">${anime.time}</span>
                        </div>
                        <div id="progress-${anime.title}" class="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div class="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-1000" style="width: ${anime.progress}%"></div>
                        </div>
                        <div class="text-right text-xs mt-1">${anime.progress}% completado</div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(dayDiv);
    });
}

function renderTrends() {
    const container = document.querySelector('#trends .grid');
    container.innerHTML = trendsData.map(trend => `
        <div class="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30 hover:scale-105 transition-all duration-500 anime-card glow-purple">
            <div class="text-4xl mb-6 text-center">
                ${trend.category === 'noticia' ? '📰' : '📊'}
            </div>
            <h3 class="text-2xl font-black mb-4 text-center">${trend.title}</h3>
            <div class="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto w-24"></div>
        </div>
    `).join('');
}

async function updateTrends() {
    trendsData = sampleTrends.concat([
        {title: `Tendencia ${new Date().toLocaleDateString()} actualizada`, category: 'noticia'},
        {title: 'Nuevo estreno detectado por IA', category: 'noticia'}
    ]);
    if (currentTab === 'trends') renderTrends();
}

function checkForumAccess() {
    if (!currentUser) {
        document.getElementById('forumContent').innerHTML = `
            <div class="text-center py-20">
                <i class="fas fa-lock text-6xl text-yellow-500 mb-8 animate-bounce"></i>
                <h2 class="text-4xl font-black mb-4">🔒 Foro Bloqueado</h2>
                <p class="text-xl mb-8">Regístrate para discutir con la comunidad</p>
                <button id="unlockForum" class="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-3xl text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-500">
                    <i class="fas fa-key mr-2"></i>Desbloquear
                </button>
            </div>
        `;
        document.getElementById('unlockForum').addEventListener('click', showLoginModal);
    } else {
        // Foro funcional para usuarios
        loadForum();
    }
}

async function loadForum() {
    const posts = await getForumPosts();
    document.getElementById('forumContent').innerHTML = `
        <div class="space-y-4 mb-8">
            ${posts.map(post => `
                <div class="bg-black/50 backdrop-blur-md rounded-2xl p-6 border-l-4 border-purple-500">
                    <div class="font-bold text-purple-400 mb-2">Usuario ${post.user_id.slice(-4)}</div>
                    <p>${post.content}</p>
                    <div class="text-xs text-purple-400 mt-4">${new Date(post.created_at).toLocaleString()}</div>
                </div>
            `).join('')}
        </div>
        <div class="p-4 bg-purple-600/30 rounded-2xl">
            <textarea id="forumPostInput" placeholder="¿Qué opinas del anime del día? 🐾" class="w-full p-4 bg-black/50 border border-purple-500 rounded-xl text-white resize-none h-24"></textarea>
            <button onclick="postToForum()" class="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold">Publicar 🗣️</button>
        </div>
    `;
}

window.postToForum = async function() {
    const content = document.getElementById('forumPostInput').value;
    if (content.trim() && await postToForum(content)) {
        loadForum();
    }
};

// Utilidades
function checkUserSession() {
    const pin = localStorage.getItem('userPin');
    if (pin) {
        // Validar sesión
        updateUIForUser();
    }
}

function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function hideLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

// Cierre modal con escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideLoginModal();
});

document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') hideLoginModal();
});

// CSS dinámico
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(style);

console.log('🚀 AniméLol inicializado completamente');
