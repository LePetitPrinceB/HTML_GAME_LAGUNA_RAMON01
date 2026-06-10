// ── ESTADO NIVEL 2 ────────────────────────────────────────
const n2 = {
    activo: false,

    // cámara
    cam: { x: 0, y: 0 },

    // dimensiones del mundo
    mundo: {
        ancho : 800,
        alto  : 2400   // 3 biomas apilados verticalmente
    },

    jugador: {
        // posición en mundo
        mundoX  : 380,
        mundoY  : 0,
        ancho   : 24,
        alto    : 32,
        velX    : 0,
        velY    : 0,
        velMax  : 180,
        acel    : 340,
        freno   : 240,

        // stats
        hp          : 100,
        hpMax       : 100,
        oxigeno     : 100,
        oxigenoMax  : 100,
        monedas     : 0,
        iframes     : 0
    },

    enemigos   : [],
    reliquias  : [],
    particulas : [],
    burbujas   : [],

    reliquiaFinalRecogida: false
};

// ── BIOMAS ────────────────────────────────────────────────
const BIOMAS = [
    { nombre: 'Arrecife Somero', yMin: 0,    yMax: 700,  drenaje: 0.8,  luz: 1.0  },
    { nombre: 'Zona de Algas',   yMin: 700,  yMax: 1600, drenaje: 1.6,  luz: 0.55 },
    { nombre: 'Fosa Abisal',     yMin: 1600, yMax: 2400, drenaje: 2.8,  luz: 0.18 }
];

function obtenerBioma(y) {
    return BIOMAS.find(b => y >= b.yMin && y < b.yMax) || BIOMAS[2];
}

// ── INICIALIZAR ───────────────────────────────────────────
function iniciarNivel2() {
    const j = n2.jugador;
    j.mundoX  = n2.mundo.ancho / 2;
    j.mundoY  = 0;
    j.velX    = 0;
    j.velY    = 0;
    j.hp      = n1.balsa.hp;   // hereda HP del nivel 1
    j.oxigeno = j.oxigenoMax;
    j.iframes = 0;
    n2.activo = true;
    n2.cam    = { x: 0, y: 0 };
    n2.reliquiaFinalRecogida = false;

    n2.enemigos   = [];
    n2.reliquias  = [];
    n2.particulas = [];
    n2.burbujas   = [];

    generarMundo();
    generarBurbujas();
}

// ── GENERACIÓN DEL MUNDO ──────────────────────────────────
function generarMundo() {
    // reliquias por bioma
    const config = [
        { yMin: 100,  yMax: 680,  cantidad: 4, valor: 10,  esFinal: false },
        { yMin: 720,  yMax: 1580, cantidad: 5, valor: 25,  esFinal: false },
        { yMin: 1640, yMax: 2350, cantidad: 3, valor: 60,  esFinal: false },
        { yMin: 2300, yMax: 2370, cantidad: 1, valor: 200, esFinal: true  }
    ];

    for (const cfg of config) {
        for (let i = 0; i < cfg.cantidad; i++) {
            n2.reliquias.push({
                mundoX  : 60 + Math.random() * (n2.mundo.ancho - 120),
                mundoY  : cfg.yMin + Math.random() * (cfg.yMax - cfg.yMin),
                radio   : cfg.esFinal ? 14 : 9,
                valor   : cfg.valor,
                esFinal : cfg.esFinal,
                fase    : Math.random() * Math.PI * 2,
                recogida: false
            });
        }
    }

    // enemigos por bioma
    spawnEnemigos(700,  1580, 6, 'patrullero');
    spawnEnemigos(1600, 2400, 5, 'acechador');
}

function spawnEnemigos(yMin, yMax, cantidad, tipo) {
    for (let i = 0; i < cantidad; i++) {
        const ex = 60 + Math.random() * (n2.mundo.ancho - 120);
        const ey = yMin + Math.random() * (yMax - yMin);
        n2.enemigos.push({
            tipo,
            mundoX : ex,
            mundoY : ey,
            ancho  : tipo === 'acechador' ? 28 : 22,
            alto   : tipo === 'acechador' ? 28 : 18,
            velX   : (Math.random() > 0.5 ? 1 : -1) * (tipo === 'acechador' ? 90 : 60),
            velY   : 0,
            fase   : Math.random() * Math.PI * 2,
            iframes: 0,
            rangoX : 120 + Math.random() * 80,
            origenX: ex
        });
    }
}

function generarBurbujas() {
    for (let i = 0; i < 60; i++) {
        n2.burbujas.push(crearBurbuja());
    }
}

function crearBurbuja() {
    return {
        mundoX: Math.random() * n2.mundo.ancho,
        mundoY: 100 + Math.random() * (n2.mundo.alto - 100),
        radio : 1.5 + Math.random() * 3.5,
        velY  : -(15 + Math.random() * 25),
        alpha : 0.15 + Math.random() * 0.25
    };
}

// ── CÁMARA ────────────────────────────────────────────────
function actualizarCamara() {
    const j  = n2.jugador;
    const cx = j.mundoX - canvas.width  / 2;
    const cy = j.mundoY - canvas.height / 2;

    n2.cam.x = Math.max(0, Math.min(n2.mundo.ancho  - canvas.width,  cx));
    n2.cam.y = Math.max(0, Math.min(n2.mundo.alto   - canvas.height, cy));
}

// ── INTENTAR ABRIR TIENDA ─────────────────────────────────
function intentarAbrirTienda() {
    if (n2.jugador.mundoY <= 40) {
        cambiarEstado(ESTADO.TIENDA);
    }
}

// ── ACTUALIZAR ────────────────────────────────────────────
function actualizarNivel2(dt) {
    if (!n2.activo) return;

    const j     = n2.jugador;
    const bioma = obtenerBioma(j.mundoY);

    // i-frames
    if (j.iframes > 0) j.iframes -= dt;

    // input WASD
    if (teclas['ArrowLeft']  || teclas['a']) j.velX -= j.acel * dt;
    else if (teclas['ArrowRight'] || teclas['d']) j.velX += j.acel * dt;
    else {
        if (Math.abs(j.velX) < j.freno * dt) j.velX = 0;
        else j.velX -= Math.sign(j.velX) * j.freno * dt;
    }

    if (teclas['ArrowUp']   || teclas['w']) j.velY -= j.acel * dt;
    else if (teclas['ArrowDown'] || teclas['s']) j.velY += j.acel * dt;
    else {
        if (Math.abs(j.velY) < j.freno * dt) j.velY = 0;
        else j.velY -= Math.sign(j.velY) * j.freno * dt;
    }

    j.velX = Math.max(-j.velMax, Math.min(j.velMax, j.velX));
    j.velY = Math.max(-j.velMax, Math.min(j.velMax, j.velY));

    j.mundoX += j.velX * dt;
    j.mundoY += j.velY * dt;

    // límites del mundo
    j.mundoX = Math.max(0, Math.min(n2.mundo.ancho - j.ancho, j.mundoX));
    j.mundoY = Math.max(0, Math.min(n2.mundo.alto  - j.alto,  j.mundoY));

    // superficie — restaurar oxígeno
    if (j.mundoY <= 0) {
        j.mundoY  = 0;
        j.oxigeno = j.oxigenoMax;
    }

    // drenaje de oxígeno
    sesion.tiempoTotal += dt;
    j.oxigeno -= bioma.drenaje * dt;
    if (j.oxigeno <= 0) {
        j.oxigeno = 0;
        n2.activo = false;
        cambiarEstado(ESTADO.GAMEOVER);
        return;
    }

    // profundidad máxima
    const prof = Math.floor(j.mundoY / 10);
    if (prof > sesion.profundidadMaxima) sesion.profundidadMaxima = prof;

    // enemigos
    for (const e of n2.enemigos) {
        if (e.iframes > 0) e.iframes -= dt;

        // patrullero: oscila en X
        if (e.tipo === 'patrullero') {
            e.fase  += dt;
            e.mundoX = e.origenX + Math.sin(e.fase * 0.8) * e.rangoX;
        }

        // acechador: persigue si está cerca
        if (e.tipo === 'acechador') {
            const dx = j.mundoX - e.mundoX;
            const dy = j.mundoY - e.mundoY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                e.mundoX += (dx / dist) * 90 * dt;
                e.mundoY += (dy / dist) * 90 * dt;
            }
        }

        // colisión jugador-enemigo
        if (j.iframes <= 0 && colisionN2(j, e)) {
            j.hp      -= 20;
            j.oxigeno -= 15;
            j.iframes  = 1.5;
            emitirParticulasN2(j.mundoX + j.ancho / 2, j.mundoY + j.alto / 2, 'rgba(255,80,80,');

            if (j.hp <= 0) {
                j.hp = 0;
                n2.activo = false;
                cambiarEstado(ESTADO.GAMEOVER);
                return;
            }
        }
    }

    // reliquias
    for (const r of n2.reliquias) {
        if (r.recogida) continue;
        r.fase += dt;

        if (colisionCirculoJugador(j, r)) {
            r.recogida = true;
            j.monedas += r.valor;
            sesion.puntaje               += r.valor * 10;
            sesion.reliquiasRecolectadas += 1;
            emitirParticulasN2(r.mundoX, r.mundoY, 'rgba(255,215,0,');

            if (r.esFinal) {
                n2.reliquiaFinalRecogida = true;
            }
        }
    }

    // victoria: reliquia final recogida Y jugador volvió a superficie
    if (n2.reliquiaFinalRecogida && j.mundoY <= 20) {
        n2.activo = false;
        cambiarEstado(ESTADO.WIN);
        return;
    }

    // burbujas
    for (let i = 0; i < n2.burbujas.length; i++) {
        const b = n2.burbujas[i];
        b.mundoY += b.velY * dt;
        if (b.mundoY < 0) {
            n2.burbujas[i] = crearBurbuja();
        }
    }

    // partículas
    for (let i = n2.particulas.length - 1; i >= 0; i--) {
        const p = n2.particulas[i];
        p.mundoX += p.vx * dt;
        p.mundoY += p.vy * dt;
        p.vida   -= dt;
        if (p.vida <= 0) n2.particulas.splice(i, 1);
    }

    actualizarCamara();
}

// ── COLISIONES ────────────────────────────────────────────
function colisionN2(j, e) {
    return j.mundoX < e.mundoX + e.ancho &&
           j.mundoX + j.ancho > e.mundoX &&
           j.mundoY < e.mundoY + e.alto  &&
           j.mundoY + j.alto  > e.mundoY;
}

function colisionCirculoJugador(j, r) {
    const cx = j.mundoX + j.ancho / 2;
    const cy = j.mundoY + j.alto  / 2;
    const dx = cx - r.mundoX;
    const dy = cy - r.mundoY;
    return Math.sqrt(dx * dx + dy * dy) < r.radio + 14;
}

// ── PARTÍCULAS ────────────────────────────────────────────
function emitirParticulasN2(x, y, color) {
    for (let i = 0; i < 10; i++) {
        const ang   = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 70;
        n2.particulas.push({
            mundoX : x,
            mundoY : y,
            vx     : Math.cos(ang) * speed,
            vy     : Math.sin(ang) * speed,
            vida   : 0.5,
            vidaMax: 0.5,
            radio  : 2 + Math.random() * 3,
            color
        });
    }
}

// ── DIBUJAR ───────────────────────────────────────────────
function dibujarNivel2(ctx) {
    const cam   = n2.cam;
    const j     = n2.jugador;
    const bioma = obtenerBioma(j.mundoY);

    // fondo según bioma
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    dibujarFondoMarino(ctx, n2.cam.y);

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    // velo de oscuridad fosa abisal
    if (j.mundoY > 1600) {
        const radio  = 180 + (1 - bioma.luz) * 60;
        const cx     = j.mundoX + j.ancho / 2;
        const cy     = j.mundoY + j.alto  / 2;
        const oscuro = ctx.createRadialGradient(cx, cy, 0, cx, cy, radio);
        oscuro.addColorStop(0,   'rgba(0,0,0,0)');
        oscuro.addColorStop(0.6, `rgba(0,0,0,${0.5 * (1 - bioma.luz)})`);
        oscuro.addColorStop(1,   `rgba(0,0,0,${0.92 * (1 - bioma.luz)})`);
        ctx.fillStyle = oscuro;
        ctx.fillRect(cam.x, cam.y, canvas.width, canvas.height);
    }

    // burbujas
    for (const b of n2.burbujas) {
        const sx = b.mundoX - cam.x;
        const sy = b.mundoY - cam.y;
        if (sx < -10 || sx > canvas.width + 10) continue;
        ctx.beginPath();
        ctx.arc(b.mundoX, b.mundoY, b.radio, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(150,220,255,${b.alpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
    }

    // líneas divisoras de bioma
    ctx.strokeStyle = 'rgba(100,180,255,0.12)';
    ctx.lineWidth   = 2;
    ctx.setLineDash([12, 8]);
    for (const b of BIOMAS) {
        ctx.beginPath();
        ctx.moveTo(0,              b.yMax);
        ctx.lineTo(n2.mundo.ancho, b.yMax);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // reliquias
    // reliquias
    for (const r of n2.reliquias) {
        if (r.recogida) continue;
        const pulso = 0.7 + Math.sin(r.fase * 2) * 0.3;

        ctx.save();
        ctx.translate(r.mundoX, r.mundoY);
        ctx.scale(pulso, pulso);

        if (r.esFinal) {
            ctx.scale(1.5, 1.5);
            dibujarEmoji(ctx, -14.4, -15);
            
            // Halo de brillo
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,215,0,0.4)';
            ctx.lineWidth = 3;
            ctx.stroke();
        } else {
            // Reliquia normal:
            dibujarEmoji(ctx, -14.4, -15);
        }

        ctx.restore();
    }

    // enemigos
    for (const e of n2.enemigos) {
        const parpadeando = e.iframes > 0 && Math.floor(e.iframes * 8) % 2 === 0;
        if (parpadeando) continue;

        ctx.save();
        ctx.translate(e.mundoX + e.ancho / 2, e.mundoY + e.alto / 2);

        if (e.tipo === 'patrullero') {
            // anguila
            ctx.fillStyle = '#2a6a4a';
            ctx.beginPath();
            ctx.ellipse(0, 0, e.ancho / 2, e.alto / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(e.ancho / 2 - 4, -2, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // acechador — medusa
            ctx.fillStyle = 'rgba(180,0,180,0.6)';
            ctx.beginPath();
            ctx.arc(0, -e.alto / 4, e.ancho / 2, Math.PI, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,100,255,0.5)';
            ctx.lineWidth   = 1;
            for (let t = -3; t <= 3; t++) {
                ctx.beginPath();
                ctx.moveTo(t * 4, e.alto / 4);
                ctx.lineTo(t * 4 + Math.sin(Date.now() / 200 + t) * 6, e.alto / 2 + 8);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // jugador
    const parpadeandoJ = j.iframes > 0 && Math.floor(j.iframes * 8) % 2 === 0;
    if (!parpadeandoJ) dibujarJugador(ctx, j);

    // partículas
    for (const p of n2.particulas) {
        const alpha = p.vida / p.vidaMax;
        ctx.beginPath();
        ctx.arc(p.mundoX, p.mundoY, p.radio, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
    }

    ctx.restore(); // fin translate cámara

    // línea de superficie
    const supY = -cam.y;
    if (supY > 0 && supY < canvas.height) {
        ctx.strokeStyle = 'rgba(100,200,255,0.5)';
        ctx.lineWidth   = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(0,            supY);
        ctx.lineTo(canvas.width, supY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function dibujarJugador(ctx, j) {
    const cx = j.mundoX + j.ancho / 2;
    const cy = j.mundoY + j.alto  / 2;

    // cuerpo buzo
    ctx.fillStyle = '#334466';
    ctx.fillRect(j.mundoX + 4, j.mundoY + 10, j.ancho - 8, j.alto - 10);

    // cabeza — casco
    ctx.fillStyle = '#aaccee';
    ctx.beginPath();
    ctx.arc(cx, j.mundoY + 8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334466';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // visor
    ctx.fillStyle = 'rgba(0,200,255,0.5)';
    ctx.beginPath();
    ctx.arc(cx + 2, j.mundoY + 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // aletas
    ctx.fillStyle = '#223355';
    ctx.beginPath();
    ctx.ellipse(j.mundoX + 2,           j.mundoY + j.alto - 4, 6, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(j.mundoX + j.ancho - 2, j.mundoY + j.alto - 4, 6, 3,  0.4, 0, Math.PI * 2);
    ctx.fill();

    // tanque de oxígeno
    ctx.fillStyle = '#556688';
    ctx.fillRect(j.mundoX + j.ancho - 6, j.mundoY + 12, 6, 14);
}

function dibujarEmoji(ctx, x, y) {
    const px = 1.2; // Escala ajustada a la hitbox del jugador

    const paleta = {
        1: '#FEE104', 2: '#91481A', 3: '#E59B21', 4: '#673610',
        5: '#69AF44', 6: '#FDF491', 7: '#0D5C32'
    };

    const sprite = [
        [0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,2,3,3,3,3,3,2,2,2,2,2,0,0,0,0,0,0],
        [0,0,0,0,2,2,3,3,1,1,1,1,1,3,3,3,2,1,2,2,0,0,0,0],
        [0,0,0,2,3,3,1,1,1,1,1,1,1,1,1,3,3,2,1,1,2,0,0,0],
        [0,0,2,3,1,1,1,1,1,1,1,1,1,1,1,1,6,3,2,1,2,0,0,0],
        [0,2,3,1,1,1,2,2,2,1,1,1,1,2,2,1,1,6,3,2,3,2,0,0],
        [0,2,3,1,1,2,1,1,1,1,1,1,1,1,1,2,2,1,6,2,1,1,2,0],
        [0,2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,2,3,3,2,0],
        [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,2,3,3,2],
        [2,3,1,1,1,4,1,1,4,1,1,1,4,1,1,4,1,1,1,6,2,3,3,2],
        [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,2,3,3,2],
        [2,3,1,1,1,1,1,1,4,1,1,1,1,1,1,4,1,1,1,6,2,3,3,2],
        [2,3,1,1,1,4,1,1,4,1,1,1,4,1,1,4,1,1,1,6,2,3,3,2],
        [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,2,3,3,2],
        [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,2,3,3,2],
        [0,2,3,1,2,2,3,1,1,1,1,1,1,1,3,2,2,1,6,3,2,3,2,0],
        [0,2,3,1,2,0,4,2,2,2,2,2,2,2,4,0,2,1,6,2,3,3,2,0],
        [0,2,3,1,1,2,0,0,7,7,7,7,7,0,0,2,1,1,3,2,3,2,2,0],
        [0,0,2,3,1,1,2,7,0,0,5,0,0,7,2,1,1,6,3,2,3,2,0,0],
        [0,0,0,2,3,6,1,7,5,0,4,0,5,0,1,1,6,3,2,3,2,0,0,0],
        [0,0,0,0,2,3,3,7,5,4,4,5,5,5,6,3,3,2,3,2,0,0,0,0],
        [0,0,0,0,0,2,2,7,5,5,4,4,5,5,3,2,2,2,2,0,0,0,0,0],
        [0,0,0,0,0,0,0,7,5,4,4,0,5,5,2,2,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,5,5,4,5,0,7,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,7,5,5,5,7,0,0,0,0,0,0,0,0,0,0,0]
    ];

    sprite.forEach((fila, fy) => {
        fila.forEach((color, fx) => {
            if (color === 0) return;
            ctx.fillStyle = paleta[color];
            // px + 0.5 previene artefactos visuales al usar transformaciones de escala
            ctx.fillRect(x + fx * px, y + fy * px, px + 0.5, px + 0.5);
        });
    });
}