// Configuración Supabase GRATUITA - Reemplaza con tus credenciales
const SUPABASE_URL = https:fjvqalelednvldlzmpbr.supabase.com; // ← CAMBIA ESTO
const SUPABASE_ANON_KEY =sb_publishable_YRSl6r_uArdI4viaxzoDBw_vej0RfNm; // ← CAMBIA ESTO

export const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Inicializar tablas si no existen (solo primera vez)
async function initDatabase() {
    try {
        // Tabla usuarios
        await supabase.rpc('create_users_table');
        // Tabla favoritos
        await supabase.rpc('create_favorites_table');
        // Tabla progreso
        await supabase.rpc('create_progress_table');
        // Tabla foro
        await supabase.rpc('create_forum_table');
        console.log('✅ Base de datos inicializada');
    } catch (error) {
        console.log('Base ya existe');
    }
}

// Gestión de usuarios
export async function loginUser(pin) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('pin', pin)
        .single();
    
    if (data) {
        localStorage.setItem('userPin', pin);
        localStorage.setItem('userId', data.id);
        return { success: true, user: data };
    }
    
    // Auto-registro si no existe
    const { data: newUser, error: regError } = await supabase
        .from('users')
        .insert({ pin, nickname: `Usuario${Math.floor(Math.random()*9999)}` })
        .select()
        .single();
    
    if (newUser) {
        localStorage.setItem('userPin', pin);
        localStorage.setItem('userId', newUser.id);
        return { success: true, user: newUser };
    }
    
    return { success: false };
}

export async function getUserFavorites() {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];
    
    const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId);
    return data || [];
}

export async function saveProgress(animeId, progress) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    await supabase
        .from('progress')
        .upsert({ user_id: userId, anime_id: animeId, progress });
}

export async function getForumPosts() {
    const { data } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
    return data || [];
}

export async function postToForum(content) {
    const userId = localStorage.getItem('userId');
    if (!userId) return false;
    
    const { error } = await supabase
        .from('forum_posts')
        .insert({ user_id: userId, content });
    return !error;
}

// Inicializar al cargar
initDatabase();
