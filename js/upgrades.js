const upgrades = {
    items: [
        {
            nombre     : 'Tanque de O₂',
            descripcion: 'Aumenta la capacidad máxima de oxígeno en +30',
            nivel      : 0,
            nivelMax   : 3,
            costo      : 30
        },
        {
            nombre     : 'Aletas Turbo',
            descripcion: 'Incrementa velocidad y aceleración de nado',
            nivel      : 0,
            nivelMax   : 3,
            costo      : 25
        },
        {
            nombre     : 'Armadura de Casco',
            descripcion: 'Aumenta HP máximo en +25 y cura +15 al comprar',
            nivel      : 0,
            nivelMax   : 2,
            costo      : 40
        }
    ]
};

// ── REINICIO DE UPGRADES ──────────────────────────────────
function reiniciarUpgrades() {
    upgrades.items[0].nivel = 0; upgrades.items[0].costo = 30;
    upgrades.items[1].nivel = 0; upgrades.items[1].costo = 25;
    upgrades.items[2].nivel = 0; upgrades.items[2].costo = 40;
}

// ── COMPRAR UPGRADE ───────────────────────────────────────
function comprarUpgrade(i) {
    const item = upgrades.items[i];
    if (!item)                        return;
    if (item.nivel >= item.nivelMax)  return;
    if (n2.jugador.monedas < item.costo) {
        mostrarMensajeTienda('¡Monedas insuficientes!', '#ff4444');
        return;
    }

    n2.jugador.monedas -= item.costo;
    item.nivel         += 1;
    sesion.mejorasAdquiridas += 1;

    // efecto según ítem
    if (i === 0) {
        // Tanque de O₂
        n2.jugador.oxigenoMax += 30;
        n2.jugador.oxigeno     = Math.min(
            n2.jugador.oxigeno + 30,
            n2.jugador.oxigenoMax
        );
        mostrarMensajeTienda('+30 O₂ máximo', '#00aaff');
    }

    if (i === 1) {
        // Aletas Turbo
        n2.jugador.velMax += 30;
        n2.jugador.acel   += 40;
        mostrarMensajeTienda('+velocidad de nado', '#44ff88');
    }

    if (i === 2) {
        // Armadura de Casco
        n2.jugador.hpMax += 25;
        n2.jugador.hp     = Math.min(
            n2.jugador.hp + 25,
            n2.jugador.hpMax
        );
        mostrarMensajeTienda('+25 HP máximo', '#ffaa00');
    }

    // escalar costo siguiente nivel
    item.costo = Math.floor(item.costo * 1.7);
}

// ── MENSAJE FLOTANTE EN TIENDA ────────────────────────────
const _mensajeTienda = { texto: '', timer: 0, color: '#ffffff' };

function mostrarMensajeTienda(texto, color = '#ffffff') {
    _mensajeTienda.texto = texto;
    _mensajeTienda.color = color;
    _mensajeTienda.timer = 1.8;
}

function tickMensajeTienda(dt) {
    if (_mensajeTienda.timer > 0) _mensajeTienda.timer -= dt;
}

function dibujarMensajeTienda(ctx) {
    if (_mensajeTienda.timer <= 0) return;
    const alpha = Math.min(1, _mensajeTienda.timer);
    dibujarTexto(ctx, _mensajeTienda.texto, canvas.width / 2, 48, {
        centrado: true,
        tamanio : 14,
        negrita : true,
        color   : _mensajeTienda.color,
        sombra  : true
    });
}