(function () {
    var canvas = document.createElement('canvas');
    var dpr = window.devicePixelRatio || 1;
    var W = 192, H = 148;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.cssText = 'display:block;margin:10px auto 0;opacity:.88;width:' + W + 'px;height:' + H + 'px;';

    var footer = document.querySelector('nav footer');
    if (!footer) return;
    footer.insertAdjacentElement('afterend', canvas);

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var LAYERS = [4, 5, 5, 3];
    var PAD_X = 20, PAD_Y = 18;

    var hidStep = (H - 2 * PAD_Y) / (LAYERS[1] - 1);
    var nodes = LAYERS.map(function (count, li) {
        var x = PAD_X + li * (W - 2 * PAD_X) / (LAYERS.length - 1);
        return Array.from({ length: count }, function (_, ni) {
            var y;
            if (li === 0) {
                // sit at midpoints between the 5 hidden-layer dots
                y = PAD_Y + hidStep / 2 + ni * hidStep;
            } else if (li === LAYERS.length - 1) {
                // align with middle 3 of hidden-layer 5 dots
                y = H / 2 + (ni - Math.floor(count / 2)) * hidStep;
            } else {
                y = count === 1 ? H / 2 : PAD_Y + ni * (H - 2 * PAD_Y) / (count - 1);
            }
            return { x: x, y: y, glow: 0 };
        });
    });

    var edges = [];
    for (var l = 0; l < LAYERS.length - 1; l++) {
        for (var i = 0; i < nodes[l].length; i++) {
            for (var j = 0; j < nodes[l + 1].length; j++) {
                edges.push({ l: l, i: i, j: j });
            }
        }
    }

    var pulses = [];
    for (var k = 0; k < 50; k++) {
        var e0 = edges[Math.floor(Math.random() * edges.length)];
        pulses.push({ l: e0.l, i: e0.i, j: e0.j, t: Math.random(), speed: 0.022 + Math.random() * 0.022 });
    }

    setInterval(function () {
        var e = edges[Math.floor(Math.random() * edges.length)];
        pulses.push({ l: e.l, i: e.i, j: e.j, t: 0, speed: 0.022 + Math.random() * 0.022 });
    }, 65);

    function draw() {
        ctx.clearRect(0, 0, W, H);
        var isHacker = document.body.classList.contains('hacker-mode');
        var nodeClr = isHacker ? 'rgba(0,255,65,0.85)' : 'rgba(255,255,255,0.85)';
        var connClr = isHacker ? 'rgba(0,255,65,0.40)' : 'rgba(255,255,255,0.45)';
        var pulseClr = isHacker ? '#00ff41' : '#ffffff';
        var glowClr = isHacker ? 'rgba(0,255,65,0.45)' : 'rgba(255,255,255,0.45)';
        var NODE_R = 5;

        for (var ei = 0; ei < edges.length; ei++) {
            var e = edges[ei];
            var a = nodes[e.l][e.i], b = nodes[e.l + 1][e.j];
            var dx = b.x - a.x, dy = b.y - a.y;
            var len = Math.sqrt(dx * dx + dy * dy);
            var ux = dx / len, uy = dy / len;
            ctx.beginPath();
            ctx.moveTo(a.x + ux * (NODE_R + 1), a.y + uy * (NODE_R + 1));
            ctx.lineTo(b.x - ux * (NODE_R + 1), b.y - uy * (NODE_R + 1));
            ctx.strokeStyle = connClr;
            ctx.lineWidth = 1.1;
            ctx.stroke();
        }

        for (var pi = 0; pi < pulses.length; pi++) {
            var p = pulses[pi];
            var pa = nodes[p.l][p.i], pb = nodes[p.l + 1][p.j];
            var px = pa.x + (pb.x - pa.x) * p.t;
            var py = pa.y + (pb.y - pa.y) * p.t;
            var alpha = Math.sin(p.t * Math.PI);
            ctx.globalAlpha = alpha;
            var grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
            grad.addColorStop(0, isHacker ? 'rgba(0,255,65,1)' : 'rgba(255,255,255,1)');
            grad.addColorStop(0.4, isHacker ? 'rgba(0,255,65,0.3)' : 'rgba(255,255,255,0.3)');
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = pulseClr;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        for (var nl = 0; nl < nodes.length; nl++) {
            for (var nn = 0; nn < nodes[nl].length; nn++) {
                var nd = nodes[nl][nn];
                if (nd.glow > 0.01) {
                    var ng = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, 18);
                    ng.addColorStop(0, glowClr);
                    ng.addColorStop(1, 'transparent');
                    ctx.beginPath();
                    ctx.arc(nd.x, nd.y, 18, 0, Math.PI * 2);
                    ctx.fillStyle = ng;
                    ctx.fill();
                    nd.glow = Math.max(0, nd.glow - 0.022);
                }
                ctx.beginPath();
                ctx.arc(nd.x, nd.y, NODE_R, 0, Math.PI * 2);
                ctx.fillStyle = nodeClr;
                ctx.globalAlpha = 0.55 + Math.min(nd.glow, 1) * 0.45;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.strokeStyle = isHacker ? 'rgba(0,255,65,0.9)' : 'rgba(255,255,255,0.9)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        for (var ui = pulses.length - 1; ui >= 0; ui--) {
            pulses[ui].t += pulses[ui].speed;
            if (pulses[ui].t >= 1) {
                nodes[pulses[ui].l + 1][pulses[ui].j].glow = 1;
                pulses.splice(ui, 1);
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
})();
