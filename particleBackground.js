/* Premium animated particle background for the landing page */
(function () {
    const canvas = document.createElement('canvas');
    canvas.className = 'particle-background-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const colors = ['#00C8FF', '#36F3FF', '#8A5CFF', '#FF9A3D'];

    let width = 0;
    let height = 0;
    let particles = [];
    let mouse = { x: null, y: null, active: false };
    let animationFrameId = null;
    let lastTime = 0;
    let isVisible = !document.hidden;

    function resize() {
        width = canvas.width = window.innerWidth * window.devicePixelRatio;
        height = canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

        const count = Math.max(70, Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 14000)));
        const baseCount = window.innerWidth < 768 ? Math.floor(count * 0.7) : count;

        particles = buildParticles(baseCount);
    }

    function buildParticles(count) {
        const list = [];
        for (let i = 0; i < count; i += 1) {
            const layer = Math.random() < 0.55 ? 0 : Math.random() < 0.8 ? 1 : 2;
            const size = Math.random() < 0.07 ? (Math.random() * 4 + 7) : Math.random() * 3 + 1;
            list.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.2,
                size,
                opacity: Math.random() * 0.45 + 0.15,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.006,
                layer,
                orbit: Math.random() * 0.7 + 0.2,
                glow: Math.random() < 0.12
            });
        }
        return list;
    }

    function drawBackground() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const gradient = ctx.createRadialGradient(
            window.innerWidth * 0.5,
            window.innerHeight * 0.2,
            0,
            window.innerWidth * 0.5,
            window.innerHeight * 0.2,
            window.innerWidth * 0.75
        );
        gradient.addColorStop(0, 'rgba(0, 200, 255, 0.05)');
        gradient.addColorStop(0.45, 'rgba(138, 92, 255, 0.03)');
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            const drift = Math.sin(performance.now() * 0.0001 * (p.layer + 1) + p.pulse) * 0.2;
            p.x += p.vx + drift * 0.02;
            p.y += p.vy + (p.layer * 0.01);

            if (p.x < -20) p.x = window.innerWidth + 20;
            if (p.x > window.innerWidth + 20) p.x = -20;
            if (p.y < -20) p.y = window.innerHeight + 20;
            if (p.y > window.innerHeight + 20) p.y = -20;

            if (mouse.active) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    p.x += (dx / dist) * force * 1.2;
                    p.y += (dy / dist) * force * 1.2;
                }
            }

            const pulseFactor = 0.7 + 0.3 * Math.sin(performance.now() * 0.001 + p.pulse + p.orbit);
            const alpha = p.opacity * (p.glow ? 1 : 0.8) * (p.size > 5 ? 0.85 : 1) * (p.glow ? pulseFactor : 1);
            const radius = p.size > 5 ? p.size * 0.5 : p.size;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = p.glow
                ? `rgba(255,255,255,${alpha * 0.35})`
                : `${p.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();

            if (p.glow) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 1.85, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${alpha * 0.12})`;
                ctx.filter = 'blur(16px)';
                ctx.fill();
                ctx.filter = 'none';
            }
        }

        for (let i = 0; i < particles.length; i += 1) {
            for (let j = i + 1; j < particles.length; j += 1) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 120) {
                    const lineAlpha = (1 - dist / 120) * 0.04;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(99, 234, 255, ${lineAlpha})`;
                    ctx.stroke();
                }
            }
        }
    }

    function animate(now) {
        if (!isVisible) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }
        if (!lastTime) lastTime = now;
        drawBackground();
        lastTime = now;
        animationFrameId = requestAnimationFrame(animate);
    }

    function burst(x, y) {
        const burstCount = 12;
        for (let i = 0; i < burstCount; i += 1) {
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 2.8,
                vy: (Math.random() - 0.5) * 2.8,
                size: Math.random() * 2 + 1.2,
                opacity: Math.random() * 0.45 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.01,
                layer: 3,
                orbit: Math.random() * 0.8 + 0.2,
                glow: Math.random() < 0.45,
                life: 1,
                decay: 0.008 + Math.random() * 0.004
            });
        }
    }

    function updateBurstParticles() {
        for (let i = particles.length - 1; i >= 0; i -= 1) {
            const p = particles[i];
            if (p.life !== undefined) {
                p.life -= p.decay;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.94;
                p.vy *= 0.94;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }
        }
    }

    function tick(now) {
        if (!isVisible) {
            animationFrameId = requestAnimationFrame(tick);
            return;
        }
        if (!lastTime) lastTime = now;
        updateBurstParticles();
        drawBackground();
        lastTime = now;
        animationFrameId = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    window.addEventListener('click', (event) => {
        burst(event.clientX, event.clientY);
    });

    resize();
    tick(0);
})();
