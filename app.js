// =========================
// Configuración general
// =========================
const API_BASE = "https://api.jikan.moe/v4";
const STORAGE_KEY_PROGRESS_PREFIX = "cap_"; // para capítulos guardados

// nombre del usuario local del chat
const USERNAME = "User_" + Math.floor(Math.random() * 999);

// referencias DOM (se asumen los mismos ids de tu HTML)
const feed = document.getElementById("anime-feed");
const oracleResult = document.getElementById("oracle-result");
const btnOracle = document.getElementById("btn-oracle");
const chatIn = document.getElementById("chat-in");
const chatBox = document.getElementById("chat-box");
const chatSend = document.getElementById("chat-send");

// =========================
// Registro del Service Worker (PWA)
// =========================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service_worker.js")
      .then(reg => console.log("Service Worker registrado:", reg.scope))
      .catch(err => console.error("Error SW:", err));
  });
}

// =========================
// 1. Motor de búsqueda + filtros (Jikan v4)
// =========================
async function executeSearch() {
  const query = document.getElementById("main-search").value.trim();
  const genre = document.getElementById("f-genre").value;
  const type = document.getElementById("f-type").value;
  const status = document.getElementById("f-status").value;
  const year = document.getElementById("f-year").value;

  if (!feed) return;
  feed.innerHTML =
    "<p style='padding:20px;'>Sincronizando con la red neuronal...</p>";

  // construcción de URL de Jikan v4 (búsqueda) [web:4][web:5]
  const params
