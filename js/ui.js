// ── CONFIGURACIÓN VISUAL ──────────────────────────────────
const COLOR = {
    agua       : '#0d3b5e',
    superfice  : '#1a6b8a',
    arena      : '#c2a05a',
    texto      : '#e8f4f8',
    textOscuro : '#0a1a2a',
    acento     : '#00d4ff',
    peligro    : '#ff4444',
    vida       : '#44ff88',
    oxigeno    : '#00aaff',
    moneda     : '#ffd700',
    overlay    : 'rgba(0,0,0,0.7)'
};

// ── UTILIDADES DE DIBUJO ──────────────────────────────────
function dibujarTexto(ctx, texto, x, y, opciones = {}) {
    const {
        color    = COLOR.texto,
        tamanio  = 16,
        fuente   = 'Arial',
        negrita  = false,
        centrado = false,
        sombra   = false
    } = opciones;

    ctx.font = `${negrita ? 'bold ' : ''}${tamanio}px ${fuente}`;

    if (sombra) {
        ctx.shadowColor   = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur    = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }

    ctx.fillStyle   = color;
    ctx.textAlign   = centrado ? 'center' : 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(texto, x, y);

    // reset sombra
    ctx.shadowColor   = 'transparent';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function dibujarBarra(ctx, x, y, ancho, alto, valor, maximo, colorRelleno, label) {
    const pct = Math.max(0, Math.min(1, valor / maximo));

    // fondo
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, ancho, alto);

    // relleno
    ctx.fillStyle = colorRelleno;
    ctx.fillRect(x, y, ancho * pct, alto);

    // borde
    ctx.strokeStyle = COLOR.texto;
    ctx.lineWidth   = 1;
    ctx.strokeRect(x, y, ancho, alto);

    // etiqueta
    if (label) {
        dibujarTexto(ctx, label, x, y - 18, { tamanio: 12, color: COLOR.texto });
    }
}

function dibujarBoton(ctx, x, y, ancho, alto, texto, hover = false) {
    ctx.fillStyle = hover ? COLOR.acento : 'rgba(0, 100, 150, 0.8)';
    ctx.fillRect(x, y, ancho, alto);

    ctx.strokeStyle = COLOR.acento;
    ctx.lineWidth   = 2;
    ctx.strokeRect(x, y, ancho, alto);

    dibujarTexto(ctx, texto, x + ancho / 2, y + alto / 2 - 8, {
        centrado: true,
        negrita : true,
        tamanio : 14,
        color   : hover ? COLOR.textOscuro : COLOR.texto
    });
}

// ── REGISTRO DE BOTONES (para detección de clicks) ────────
const botonesActivos = [];

function registrarBoton(id, x, y, ancho, alto, callback) {
    botonesActivos.push({ id, x, y, ancho, alto, callback });
}

function limpiarBotones() {
    botonesActivos.length = 0;
}

function uiClickMenu(mx, my) {
    procesarClickBotones(mx, my);
}

function uiClickTienda(mx, my) {
    procesarClickBotones(mx, my);
}

function uiClickFinJuego(mx, my) {
    procesarClickBotones(mx, my);
}

function procesarClickBotones(mx, my) {
    for (const btn of botonesActivos) {
        if (mx >= btn.x && mx <= btn.x + btn.ancho &&
            my >= btn.y && my <= btn.y + btn.alto) {
            btn.callback();
            return;
        }
    }
}

// ── MENÚ PRINCIPAL ────────────────────────────────────────
function dibujarMenu(ctx) {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;

    // fondo degradado
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a1a2e');
    grad.addColorStop(1, '#0d3b5e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // título
    dibujarTexto(ctx, 'El Encanto de la', cx, 80, {
        centrado: true, tamanio: 22, color: COLOR.acento, sombra: true
    });
    dibujarTexto(ctx, 'Laguna de Ramón', cx, 112, {
        centrado: true, tamanio: 36, negrita: true, color: COLOR.texto, sombra: true
    });

    // subtítulo
    dibujarTexto(ctx, 'Región Piura — Perú', cx, 162, {
        centrado: true, tamanio: 14, color: '#88bbcc'
    });

    // separador
    ctx.strokeStyle = COLOR.acento;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 150, 190);
    ctx.lineTo(cx + 150, 190);
    ctx.stroke();

    // descripción
    dibujarTexto(ctx, 'Cruza la laguna en balsa y sumérgete', cx, 210, {
        centrado: true, tamanio: 13, color: '#aaccdd'
    });
    dibujarTexto(ctx, 'a recuperar las reliquias del fondo.', cx, 230, {
        centrado: true, tamanio: 13, color: '#aaccdd'
    });

    // botón jugar
    limpiarBotones();
    const bx = cx - 80, by = cy + 20;
    dibujarBoton(ctx, bx, by, 160, 45, 'JUGAR');
    registrarBoton('jugar', bx, by, 160, 45, () => cambiarEstado(ESTADO.NIVEL1));

    // instrucciones
    dibujarTexto(ctx, 'O presiona  ENTER  para comenzar', cx, by + 65, {
        centrado: true, tamanio: 12, color: '#667788'
    });

    dibujarTexto(ctx, 'Nivel 1: ← → para mover la balsa', cx, by + 100, {
        centrado: true, tamanio: 12, color: '#556677'
    });
    dibujarTexto(ctx, 'Nivel 2: WASD para bucear  |  E para tienda', cx, by + 118, {
        centrado: true, tamanio: 12, color: '#556677'
    });
}

// ── HUD NIVEL 1 ───────────────────────────────────────────
function dibujarHUD(ctx) {
    if (typeof n1 === 'undefined') return;

    dibujarBarra(ctx, 20, 20, 150, 16, n1.tiempoRestante, 60, '#00cc66', 'TIEMPO');
    dibujarTexto(ctx, `${Math.ceil(n1.tiempoRestante)}s`, 178, 20, { tamanio: 14, negrita: true });

    const anchoTexto = ctx.measureText(`PUNTAJE: ${sesion.puntaje}`).width;
    dibujarTexto(ctx, `PUNTAJE: ${sesion.puntaje}`,
        canvas.width - anchoTexto - 20, 20, { tamanio: 14, negrita: true });
}

// ── HUD NIVEL 2 ───────────────────────────────────────────
function dibujarHUDNivel2(ctx) {
    if (typeof n2 === 'undefined') return;

    // barra O₂
    dibujarBarra(ctx, 20, 20, 160, 16, n2.jugador.oxigeno, n2.jugador.oxigenoMax,
        COLOR.oxigeno, 'OXÍGENO');

    // barra HP
    dibujarBarra(ctx, 20, 56, 160, 16, n2.jugador.hp, n2.jugador.hpMax,
        COLOR.vida, 'SALUD');

    // profundidad
    const prof = Math.max(0, Math.floor(n2.jugador.mundoY / 10));
    dibujarTexto(ctx, `PROF: ${prof}m`, 20, 92, { tamanio: 13 });

    if (prof > sesion.profundidadMaxima) sesion.profundidadMaxima = prof;

    // reliquias
    dibujarTexto(ctx, `RELIQUIAS: ${sesion.reliquiasRecolectadas}`, 20, 112, {
        tamanio: 13, color: COLOR.acento
    });

    // monedas
    dibujarTexto(ctx, `MONEDAS: ${n2.jugador.monedas}`, 20, 132, {
        tamanio: 13, color: COLOR.moneda
    });

    // instrucción tienda en superficie
    if (n2.jugador.mundoY <= 20) {
        dibujarTexto(ctx, 'Presiona  E  para abrir tienda', canvas.width / 2, 20, {
            centrado: true, tamanio: 13, color: COLOR.acento
        });
    }

    // bioma actual
    const bioma = obtenerNombreBioma(n2.jugador.mundoY);
    dibujarTexto(ctx, bioma, canvas.width - 160, 20, { tamanio: 12, color: '#aaccdd' });
}

function obtenerNombreBioma(y) {
    if (y < 300)  return '🐠 Arrecife Somero';
    if (y < 700)  return '🌿 Zona de Algas';
    return '🕳️ Fosa Abisal';
}

// ── PANTALLA DE TRANSICIÓN ────────────────────────────────
let _transicionTimer = 0;

function dibujarTransicion(ctx) {
    _transicionTimer += 0.016;

    ctx.fillStyle = 'rgba(0,10,20,0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    dibujarTexto(ctx, '¡Zona de buceo alcanzada!', canvas.width / 2, 180, {
        centrado: true, tamanio: 24, negrita: true, color: COLOR.acento, sombra: true
    });
    dibujarTexto(ctx, 'Prepárate para sumergirte...', canvas.width / 2, 220, {
        centrado: true, tamanio: 16, color: COLOR.texto
    });

    if (_transicionTimer >= 2.5) {
        _transicionTimer = 0;
        cambiarEstado(ESTADO.NIVEL2);
    }
}

// ── PANTALLA FIN DE JUEGO ─────────────────────────────────
function dibujarFinJuego(ctx, victoria) {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = COLOR.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (victoria) {
        dibujarTexto(ctx, '¡VICTORIA!', cx, cy - 120, {
            centrado: true, tamanio: 48, negrita: true, color: COLOR.acento, sombra: true
        });
        dibujarTexto(ctx, 'Recuperaste la reliquia de la Laguna de Ramón', cx, cy - 60, {
            centrado: true, tamanio: 15, color: COLOR.texto
        });
    } else {
        dibujarTexto(ctx, 'GAME OVER', cx, cy - 120, {
            centrado: true, tamanio: 48, negrita: true, color: COLOR.peligro, sombra: true
        });
        dibujarTexto(ctx, 'El oxígeno se agotó en las profundidades...', cx, cy - 60, {
            centrado: true, tamanio: 15, color: COLOR.texto
        });
    }

    // estadísticas
    const stats = [
        `Puntaje final:      ${sesion.puntaje}`,
        `Tiempo:             ${sesion.tiempoTotal}s`,
        `Profundidad máx:    ${sesion.profundidadMaxima}m`,
        `Reliquias:          ${sesion.reliquiasRecolectadas}`,
        `Mejoras adquiridas: ${sesion.mejorasAdquiridas}`
    ];

    stats.forEach((linea, i) => {
        dibujarTexto(ctx, linea, cx, cy - 20 + i * 24, {
            centrado: true, tamanio: 13, color: '#aaccdd'
        });
    });

    // botón reiniciar
    limpiarBotones();
    const bx = cx - 90, by = cy + 120;
    dibujarBoton(ctx, bx, by, 180, 45, 'VOLVER AL MENÚ');
    registrarBoton('reiniciar', bx, by, 180, 45, reiniciarJuego);

    dibujarTexto(ctx, 'O presiona  ENTER', cx, by + 55, {
        centrado: true, tamanio: 12, color: '#556677'
    });
}

// ── TIENDA (dibujada sobre canvas congelado) ──────────────
function dibujarTienda(ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const cx = canvas.width  / 2;
    const px = cx - 200, py = 60;
    const pw = 400,      ph = 380;

    ctx.fillStyle = 'rgba(5, 20, 40, 0.95)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = COLOR.acento;
    ctx.lineWidth   = 2;
    ctx.strokeRect(px, py, pw, ph);

    dibujarTexto(ctx, '⚓ TIENDA DE SUPERFICIE', cx, py + 16, {
        centrado: true, tamanio: 16, negrita: true, color: COLOR.acento
    });

    dibujarTexto(ctx, `Monedas: ${typeof n2 !== 'undefined' ? n2.jugador.monedas : 0}`,
        cx, py + 42, { centrado: true, tamanio: 13, color: COLOR.moneda });

    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(px + 20, py + 65);
    ctx.lineTo(px + pw - 20, py + 65);
    ctx.stroke();

    limpiarBotones();

    if (typeof upgrades !== 'undefined') {
        upgrades.items.forEach((item, i) => {
            const iy       = py + 80 + i * 90;
            const comprado = item.nivel >= item.nivelMax;

            dibujarTexto(ctx, item.nombre, px + 20, iy, {
                tamanio: 14, negrita: true, color: COLOR.texto
            });
            dibujarTexto(ctx, item.descripcion, px + 20, iy + 20, {
                tamanio: 11, color: '#8899aa'
            });
            dibujarTexto(ctx, `Nivel ${item.nivel}/${item.nivelMax}`, px + 20, iy + 38, {
                tamanio: 11, color: COLOR.acento
            });

            const etiqueta = comprado ? 'MÁXIMO' : `${item.costo} 🪙`;
            dibujarBoton(ctx, px + pw - 120, iy, 100, 36, etiqueta, !comprado);
            if (!comprado) {
                registrarBoton(`upgrade_${i}`, px + pw - 120, iy, 100, 36,
                    () => comprarUpgrade(i));
            }
        });
    }

    const bx = cx - 70, by = py + ph - 50;
    dibujarBoton(ctx, bx, by, 140, 36, 'CERRAR  [ESC]');
    registrarBoton('cerrar_tienda', bx, by, 140, 36, () => cambiarEstado(ESTADO.NIVEL2));

    ctx.restore();
}