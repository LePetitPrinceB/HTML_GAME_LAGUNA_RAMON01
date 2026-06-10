// ── ESTADO NIVEL 1 ────────────────────────────────────────
const n1 = {
    tiempoRestante  : 60,
    activo          : false,
    iframes         : 0,

    balsa: {
        x     : 80,
        y     : 220,
        ancho : 80,
        alto  : 24,
        vel   : 0,
        velMax: 200,
        acel  : 380,
        freno : 260,
        hp    : 100,
        hpMax : 100
    },

    obstaculos     : [],
    particulas     : [],
    corrientes     : [],
    viento         : [],
    spawnerTimer   : 0,
    spawnerIntervalo: 1.6
};

// ── INICIALIZAR ───────────────────────────────────────────
function iniciarNivel1() {
    n1.tiempoRestante    = 60;
    n1.activo            = true;
    n1.iframes           = 0;
    n1.obstaculos        = [];
    n1.particulas        = [];
    n1.spawnerTimer      = 0;
    n1.spawnerIntervalo  = 1.6;

    n1.balsa.x   = 80;
    n1.balsa.y   = canvas.height / 2 - n1.balsa.alto / 2;
    n1.balsa.vel = 0;
    n1.balsa.hp  = n1.balsa.hpMax;

    // líneas de corriente
    n1.corrientes = [];
    for (let i = 0; i < 18; i++) {
        n1.corrientes.push({
            x      : Math.random() * canvas.width,
            y      : 40 + Math.random() * (canvas.height - 80),
            largo  : 40 + Math.random() * 80,
            vel    : 120 + Math.random() * 100,
            alpha  : 0.06 + Math.random() * 0.12
        });
    }

    // partículas de viento
    n1.viento = [];
    for (let i = 0; i < 35; i++) {
        n1.viento.push(crearParticulaViento());
    }
}

function crearParticulaViento() {
    return {
        x    : Math.random() * canvas.width,
        y    : Math.random() * canvas.height,
        largo: 4 + Math.random() * 10,
        velX : -(60 + Math.random() * 40),
        velY : 8  + Math.random() * 14,
        alpha: 0.08 + Math.random() * 0.14
    };
}

// ── SPAWN DE OBSTÁCULOS ───────────────────────────────────
const TIPOS_N1 = [
    { tipo: 'tronco',   ancho: 72, alto: 16, daño: 25, velX: -110 },
    { tipo: 'escombro', ancho: 26, alto: 26, daño: 20, velX: -130 },
    { tipo: 'camalote', ancho: 50, alto: 20, daño: 10, velX:  -90 }
];

function spawnObstaculo() {
    const def   = TIPOS_N1[Math.floor(Math.random() * TIPOS_N1.length)];
    const margen = 60;
    n1.obstaculos.push({
        ...def,
        x      : canvas.width + 10,
        y      : margen + Math.random() * (canvas.height - margen * 2 - def.alto),
        angulo : 0,
        velRot : (Math.random() - 0.5) * 1.5,
        fase   : Math.random() * Math.PI * 2,   // para oscilación vertical leve
        velOsc : 0.4 + Math.random() * 0.6,
        ampOsc : 6  + Math.random() * 12
    });
}

// ── PARTÍCULAS DE IMPACTO ─────────────────────────────────
function emitirParticulas(x, y, color = 'rgba(180,100,40,') {
    for (let i = 0; i < 12; i++) {
        const ang   = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 90;
        n1.particulas.push({
            x, y,
            vx     : Math.cos(ang) * speed,
            vy     : Math.sin(ang) * speed,
            vida   : 0.5,
            vidaMax: 0.5,
            radio  : 2 + Math.random() * 3,
            color
        });
    }
}

// ── COLISIÓN AABB ─────────────────────────────────────────
function colisionAABB(a, b) {
    return a.x < b.x + b.ancho &&
           a.x + a.ancho > b.x &&
           a.y < b.y + b.alto  &&
           a.y + a.alto  > b.y;
}

// ── ACTUALIZAR ────────────────────────────────────────────
function actualizarNivel1(dt) {
    if (!n1.activo) return;

    // timer
    n1.tiempoRestante -= dt;
    sesion.tiempoTotal += dt;
    if (n1.iframes > 0) n1.iframes -= dt;

    if (n1.tiempoRestante <= 0) {
        n1.tiempoRestante = 0;
        n1.activo = false;
        cambiarEstado(ESTADO.TRANSICION);
        return;
    }

    // dificultad progresiva
    const progreso = 1 - n1.tiempoRestante / 60;
    n1.spawnerIntervalo = Math.max(0.5, 1.6 - progreso * 1.1);

    // input balsa ↑↓
    const b = n1.balsa;
    if (teclas['ArrowUp'] || teclas['w']) {
        b.vel -= b.acel * dt;
    } else if (teclas['ArrowDown'] || teclas['s']) {
        b.vel += b.acel * dt;
    } else {
        if (Math.abs(b.vel) < b.freno * dt) b.vel = 0;
        else b.vel -= Math.sign(b.vel) * b.freno * dt;
    }

    b.vel = Math.max(-b.velMax, Math.min(b.velMax, b.vel));
    b.y  += b.vel * dt;
    b.y   = Math.max(36, Math.min(canvas.height - b.alto - 36, b.y));

    // spawner
    n1.spawnerTimer += dt;
    if (n1.spawnerTimer >= n1.spawnerIntervalo) {
        n1.spawnerTimer = 0;
        spawnObstaculo();
    }

    // actualizar obstáculos
    for (let i = n1.obstaculos.length - 1; i >= 0; i--) {
        const o = n1.obstaculos[i];
        o.x      += o.velX * dt;
        o.angulo += o.velRot * dt;
        o.fase   += o.velOsc * dt;
        o.y      += Math.sin(o.fase) * o.ampOsc * dt;

        // colisión
        if (n1.iframes <= 0 && colisionAABB(b, o)) {
            b.hp -= o.daño;
            n1.iframes = 1.2;
            emitirParticulas(b.x + b.ancho / 2, b.y + b.alto / 2);
            n1.obstaculos.splice(i, 1);

            if (b.hp <= 0) {
                b.hp = 0;
                n1.activo = false;
                cambiarEstado(ESTADO.GAMEOVER);
                return;
            }
            continue;
        }

        // esquivado — suma puntaje
        if (o.x + o.ancho < 0) {
            n1.obstaculos.splice(i, 1);
            sesion.puntaje += 10;
        }
    }

    // corrientes
    for (const c of n1.corrientes) {
        c.x -= c.vel * dt;
        if (c.x + c.largo < 0) c.x = canvas.width + c.largo;
    }

    // viento
    for (let i = 0; i < n1.viento.length; i++) {
        const v = n1.viento[i];
        v.x += v.velX * dt;
        v.y += v.velY * dt;
        if (v.x < -20 || v.y > canvas.height + 10) {
            n1.viento[i] = crearParticulaViento();
            n1.viento[i].x = v.x < -20 ? canvas.width + 10 : Math.random() * canvas.width;
            n1.viento[i].y = v.x < -20 ? Math.random() * canvas.height : -10;
        }
    }

    // partículas de impacto
    for (let i = n1.particulas.length - 1; i >= 0; i--) {
        const p = n1.particulas[i];
        p.x    += p.vx * dt;
        p.y    += p.vy * dt;
        p.vida -= dt;
        if (p.vida <= 0) n1.particulas.splice(i, 1);
    }
}

// ── DIBUJAR ───────────────────────────────────────────────
function dibujarNivel1(ctx) {
    // fondo agua
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0a2a3e');
    grad.addColorStop(1, '#0d4a6e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ribera superior
    ctx.fillStyle = '#1a5a3a';
    ctx.fillRect(0, 0, canvas.width, 36);
    ctx.fillStyle = '#2a7a4a';
    ctx.fillRect(0, 32, canvas.width, 8);

    // ribera inferior
    ctx.fillStyle = '#1a5a3a';
    ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
    ctx.fillStyle = '#2a7a4a';
    ctx.fillRect(0, canvas.height - 44, canvas.width, 10);

    // líneas de corriente
    for (const c of n1.corrientes) {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + c.largo, c.y);
        ctx.strokeStyle = `rgba(100,200,255,${c.alpha})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
    }

    // viento
    for (const v of n1.viento) {
        ctx.beginPath();
        ctx.moveTo(v.x, v.y);
        ctx.lineTo(v.x - v.largo, v.y + v.largo * 0.4);
        ctx.strokeStyle = `rgba(200,230,255,${v.alpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
    }

    // obstáculos
    for (const o of n1.obstaculos) {
        ctx.save();
        ctx.translate(o.x + o.ancho / 2, o.y + o.alto / 2);
        ctx.rotate(o.angulo);

        if (o.tipo === 'tronco') {
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(-o.ancho / 2, -o.alto / 2, o.ancho, o.alto);
            ctx.strokeStyle = '#3a2010';
            ctx.lineWidth   = 2;
            ctx.strokeRect(-o.ancho / 2, -o.alto / 2, o.ancho, o.alto);
            // veta de madera
            ctx.strokeStyle = 'rgba(90,60,20,0.5)';
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(-o.ancho / 2 + 10, 0);
            ctx.lineTo(o.ancho / 2 - 10, 0);
            ctx.stroke();

        } else if (o.tipo === 'escombro') {
            ctx.fillStyle = '#556677';
            ctx.beginPath();
            ctx.moveTo(0,          -o.alto / 2);
            ctx.lineTo(o.ancho / 2, 0);
            ctx.lineTo(o.ancho / 3, o.alto / 2);
            ctx.lineTo(-o.ancho / 3, o.alto / 2);
            ctx.lineTo(-o.ancho / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#334455';
            ctx.lineWidth   = 1.5;
            ctx.stroke();

        } else if (o.tipo === 'camalote') {
            ctx.fillStyle = '#2a5a2a';
            ctx.beginPath();
            ctx.ellipse(0, 0, o.ancho / 2, o.alto / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1a4a1a';
            ctx.lineWidth   = 1.5;
            ctx.stroke();
            // detalle hoja
            ctx.strokeStyle = 'rgba(60,120,60,0.6)';
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(-o.ancho / 2 + 8, 0);
            ctx.lineTo(o.ancho / 2 - 8, 0);
            ctx.stroke();
        }

        ctx.restore();
    }

    // flash de daño (balsa parpadea en rojo)
    const b = n1.balsa;
    const parpadeando = n1.iframes > 0 && Math.floor(n1.iframes * 8) % 2 === 0;
    if (!parpadeando) dibujarBalsa(ctx, b);

    // partículas de impacto
    for (const p of n1.particulas) {
        const alpha = p.vida / p.vidaMax;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
    }
}

function dibujarBalsa(ctx, b) {
    // casco
    ctx.fillStyle = '#8B5E3C';
    ctx.beginPath();
    ctx.moveTo(b.x + b.ancho,     b.y + 6);
    ctx.lineTo(b.x + b.ancho - 6, b.y + b.alto);
    ctx.lineTo(b.x + 6,           b.y + b.alto);
    ctx.lineTo(b.x,               b.y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // tablones
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth   = 1;
    for (let i = 1; i < 4; i++) {
        const lx = b.x + (b.ancho / 4) * i;
        ctx.beginPath();
        ctx.moveTo(lx, b.y + 6);
        ctx.lineTo(lx, b.y + b.alto);
        ctx.stroke();
    }

    // mástil
    const mx = b.x + b.ancho / 2;
    ctx.strokeStyle = '#3a2a0a';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(mx, b.y + 6);
    ctx.lineTo(mx, b.y - 28);
    ctx.stroke();

    // vela — apunta hacia la derecha (avance)
    ctx.fillStyle = 'rgba(230,220,180,0.88)';
    ctx.beginPath();
    ctx.moveTo(mx,      b.y - 28);
    ctx.lineTo(mx + 26, b.y - 10);
    ctx.lineTo(mx,      b.y + 4);
    ctx.closePath();
    ctx.fill();
}

// ── HUD NIVEL 1 EXTENDIDO (reemplaza dibujarHUD en ui.js) ─
function dibujarHUD(ctx) {
    const b = n1.balsa;

    // barra de tiempo
    dibujarBarra(ctx, 20, 20, 150, 14, n1.tiempoRestante, 60, '#00cc66', 'TIEMPO');
    dibujarTexto(ctx, `${Math.ceil(n1.tiempoRestante)}s`, 178, 20, { tamanio: 13, negrita: true });

    // barra de casco
    const colorHP = b.hp > 50 ? '#44ff88' : b.hp > 25 ? '#ffaa00' : '#ff4444';
    dibujarBarra(ctx, 20, 52, 150, 14, b.hp, b.hpMax, colorHP, 'CASCO');
    dibujarTexto(ctx, `${b.hp}`, 178, 52, { tamanio: 13, negrita: true });

    // puntaje
    const txt = `PUNTAJE: ${sesion.puntaje}`;
    const tw  = ctx.measureText(txt).width + 20;
    dibujarTexto(ctx, txt, canvas.width - tw, 20, { tamanio: 13, negrita: true });
}