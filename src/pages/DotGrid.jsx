import React, { useRef, useEffect } from 'react';

const DotGrid = ({
    dotSize = 3,
    gap = 29,
    baseColor = '#271E37',
    activeColor = '#5227FF',
    proximity = 100,
    shockRadius = 190,
    shockStrength = 5,
    resistance = 750,
    returnDuration = 1.5,
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = containerRef.current;

        let animationFrameId;
        let dots = [];
        let mouse = { x: -1000, y: -1000 };

        const initDots = () => {
            dots = [];
            const width = canvas.width;
            const height = canvas.height;
            for (let x = gap / 2; x < width; x += gap) {
                for (let y = gap / 2; y < height; y += gap) {
                    dots.push({
                        originX: x,
                        originY: y,
                        x: x,
                        y: y,
                        vx: 0,
                        vy: 0,
                    });
                }
            }
        };

        const resize = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            initDots();
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e) => {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);

        const lerpColor = (a, b, amount) => {
            const ah = parseInt(a.replace(/#/g, ''), 16),
                ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
                bh = parseInt(b.replace(/#/g, ''), 16),
                br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
                rr = ar + amount * (br - ar),
                rg = ag + amount * (bg - ag),
                rb = ab + amount * (bb - ab);
            return '#' + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1);
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const stiffness = 1 / returnDuration;

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];

                // Calculate distance to mouse
                const dx = mouse.x - dot.x;
                const dy = mouse.y - dot.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Interaction
                if (dist < shockRadius) {
                    const force = (shockRadius - dist) / shockRadius;
                    const angle = Math.atan2(dy, dx);
                    const pushX = Math.cos(angle) * force * shockStrength;
                    const pushY = Math.sin(angle) * force * shockStrength;

                    dot.vx -= pushX / (resistance * 0.01);
                    dot.vy -= pushY / (resistance * 0.01);
                }

                // Return to original position
                const dxReturn = dot.originX - dot.x;
                const dyReturn = dot.originY - dot.y;

                dot.vx += dxReturn * stiffness * 0.1;
                dot.vy += dyReturn * stiffness * 0.1;

                // Friction
                dot.vx *= 0.9;
                dot.vy *= 0.9;

                dot.x += dot.vx;
                dot.y += dot.vy;

                // Color transition based on proximity
                const distOrigin = Math.sqrt(Math.pow(mouse.x - dot.originX, 2) + Math.pow(mouse.y - dot.originY, 2));
                let amount = 0;
                if (distOrigin < proximity) {
                    amount = 1 - (distOrigin / proximity);
                }

                ctx.fillStyle = lerpColor(baseColor, activeColor, amount);
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [dotSize, gap, baseColor, activeColor, proximity, shockRadius, shockStrength, resistance, returnDuration]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
};

export default DotGrid;
