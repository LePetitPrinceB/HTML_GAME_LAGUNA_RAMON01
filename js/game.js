const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

canvas.width  = 800;
canvas.height = 500;

// ── ESTADOS ──────────────────────────────────────────────
const ESTADO = {
    MENU       : 'MENU',
    NIVEL1     : 'NIVEL1',
    TRANSICION : 'TRANSICION',
    NIVEL2     : 'NIVEL2',
    TIENDA     : 'TIENDA',
    WIN        : 'WIN',
    GAMEOVER   : 'GAMEOVER'
};

let estadoActual = ESTADO.MENU;

// ── DATOS DE SESIÓN ───────────────────────────────────────
const sesion = {
    nombre               : 'Jugador',
    puntaje              : 0,
    tiempoTotal          : 0,
    profundidadMaxima    : 0,
    reliquiasRecolectadas: 0,
    mejorasAdquiridas    : 0,
    nivelAlcanzado       : 1
};

// ── INPUT ─────────────────────────────────────────────────
const teclas = {};

window.addEventListener('keydown', e => {
    teclas[e.key] = true;
    manejarKeyDown(e.key);
});

window.addEventListener('keyup', e => {
    teclas[e.key] = false;
});

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    manejarClick(mx, my);
});

// ── CAMBIO DE ESTADO ──────────────────────────────────────
function cambiarEstado(nuevoEstado) {
    estadoActual = nuevoEstado;

    if (nuevoEstado === ESTADO.NIVEL1) {
        iniciarNivel1();
    } else if (nuevoEstado === ESTADO.NIVEL2) {
        sesion.nivelAlcanzado = 2;
        iniciarNivel2();
    } else if (nuevoEstado === ESTADO.WIN || nuevoEstado === ESTADO.GAMEOVER) {
        enviarRecord();
    }
}

// ── INPUT DELEGADO ────────────────────────────────────────
function manejarKeyDown(key) {
    if (estadoActual === ESTADO.MENU && key === 'Enter') {
        cambiarEstado(ESTADO.NIVEL1);
    }
    if (estadoActual === ESTADO.NIVEL2 && key === 'e') {
        // interacción tienda solo en superficie
        intentarAbrirTienda();
    }
    if (estadoActual === ESTADO.TIENDA && key === 'Escape') {
        cambiarEstado(ESTADO.NIVEL2);
    }
    if ((estadoActual === ESTADO.WIN || estadoActual === ESTADO.GAMEOVER) && key === 'Enter') {
        reiniciarJuego();
    }
    if (estadoActual === ESTADO.MENU && key === 'F2') {
    sesion.nivelAlcanzado = 2;
    n1.balsa.hp = 100;
    cambiarEstado(ESTADO.NIVEL2);
    }
}

function manejarClick(mx, my) {
    if (estadoActual === ESTADO.MENU) {
        uiClickMenu(mx, my);
    } else if (estadoActual === ESTADO.TIENDA) {
        uiClickTienda(mx, my);
    } else if (estadoActual === ESTADO.WIN || estadoActual === ESTADO.GAMEOVER) {
        uiClickFinJuego(mx, my);
    }
}

// ── REINICIO ──────────────────────────────────────────────
function reiniciarJuego() {
    sesion.puntaje               = 0;
    sesion.tiempoTotal           = 0;
    sesion.profundidadMaxima     = 0;
    sesion.reliquiasRecolectadas = 0;
    sesion.mejorasAdquiridas     = 0;
    sesion.nivelAlcanzado        = 1;
    cambiarEstado(ESTADO.MENU);
    reiniciarUpgrades();
}

// ── ENVÍO A BD ────────────────────────────────────────────
async function enviarRecord() {
    try {
        const res = await fetch('/laguna-ramon/api/guardar_record.php', {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({
                nombre_jugador        : sesion.nombre,
                puntaje_total         : sesion.puntaje,
                tiempo_total_segundos : sesion.tiempoTotal,
                profundidad_maxima    : sesion.profundidadMaxima,
                reliquias_recolectadas: sesion.reliquiasRecolectadas,
                mejoras_adquiridas    : sesion.mejorasAdquiridas,
                nivel_alcanzado       : sesion.nivelAlcanzado
            })
        });
        const data = await res.json();
        console.log('Record guardado, id:', data.id);
    } catch (err) {
        console.error('Error al guardar record:', err);
    }
}

// ── LOOP PRINCIPAL ────────────────────────────────────────
let ultimoTiempo = null;

function loop(timestamp) {
    if (ultimoTiempo === null) {
        ultimoTiempo = timestamp;
        requestAnimationFrame(loop);
        return;
    }

    const dt = Math.min((timestamp - ultimoTiempo) / 1000, 0.05);
    ultimoTiempo = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (estadoActual) {
        case ESTADO.MENU:
            dibujarMenu(ctx);
            break;
        case ESTADO.NIVEL1:
            actualizarNivel1(dt);
            dibujarNivel1(ctx);
            dibujarHUD(ctx);
            break;
        case ESTADO.TRANSICION:
            dibujarTransicion(ctx);
            break;
        case ESTADO.NIVEL2:
            actualizarNivel2(dt);
            dibujarNivel2(ctx);
            dibujarHUDNivel2(ctx);
            break;
        case ESTADO.TIENDA:
            tickMensajeTienda(dt);
            dibujarNivel2(ctx);
            dibujarTienda(ctx);
            dibujarMensajeTienda(ctx);
            break;
        case ESTADO.WIN:
            dibujarFinJuego(ctx, true);
            break;
        case ESTADO.GAMEOVER:
            dibujarFinJuego(ctx, false);
            break;
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);