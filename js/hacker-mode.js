(function () {
    var GLITCH = '!@#$%^&*<>[]{}|/\\01~`;:.?';
    var active = false;
    var glitchTimer = null;
    var encodeTimer = null;  // guards the delayed encodeHeadings call
    var textTargets = [];    // paragraphs: [{node, original}]
    var headingTargets = []; // headings:   [{node, original}]

    function rndChar() {
        return GLITCH[Math.floor(Math.random() * GLITCH.length)];
    }

    function firstTextNode(el) {
        for (var i = 0; i < el.childNodes.length; i++) {
            var n = el.childNodes[i];
            if (n.nodeType === 3 && n.nodeValue.trim().length > 1) return n;
        }
        return null;
    }

    // Convert a string to space-separated 8-bit (ASCII) or 16-bit (non-ASCII) binary
    function toBinary(text) {
        return text.split('').map(function (ch) {
            if (ch === '\n') return '\n';
            var code = ch.charCodeAt(0);
            return code.toString(2).padStart(code > 127 ? 16 : 8, '0');
        }).join(' ');
    }

    // Matrix-decode: full scramble for preGlitch ms → lock in left-to-right over duration ms
    function decodeAnimate(node, original) {
        var start = null;
        var preGlitch = 500;
        var duration  = 1200;
        function frame(ts) {
            if (!active) { node.nodeValue = original; return; }
            if (!start) start = ts;
            var elapsed = ts - start;
            if (elapsed < preGlitch) {
                node.nodeValue = original.split('').map(function (ch) {
                    return (ch === ' ' || ch === '\n') ? ch : rndChar();
                }).join('');
                requestAnimationFrame(frame);
                return;
            }
            var p = Math.min((elapsed - preGlitch) / duration, 1);
            var out = '';
            for (var i = 0; i < original.length; i++) {
                var ch = original[i];
                out += (ch === ' ' || ch === '\n' || i / original.length < p) ? ch : rndChar();
            }
            node.nodeValue = out;
            if (p < 1) requestAnimationFrame(frame);
            else node.nodeValue = original;
        }
        requestAnimationFrame(frame);
    }

    // Matrix-encode: full scramble for preGlitch ms → lock in binary left-to-right over duration ms
    function encodeAnimate(node, originalText) {
        var binary = toBinary(originalText);
        var start = null;
        var preGlitch = 500;
        var duration  = 1200;
        function frame(ts) {
            if (!active) { node.nodeValue = originalText; return; }
            if (!start) start = ts;
            var elapsed = ts - start;
            if (elapsed < preGlitch) {
                node.nodeValue = originalText.split('').map(function (ch) {
                    return (ch === ' ' || ch === '\n') ? ch : rndChar();
                }).join('');
                requestAnimationFrame(frame);
                return;
            }
            var p = Math.min((elapsed - preGlitch) / duration, 1);
            var out = '';
            for (var i = 0; i < binary.length; i++) {
                var ch = binary[i];
                out += (ch === ' ' || ch === '\n' || i / binary.length < p) ? ch : rndChar();
            }
            node.nodeValue = out;
            if (p < 1) requestAnimationFrame(frame);
            else node.nodeValue = binary;
        }
        requestAnimationFrame(frame);
    }

    function encodeHeadings() {
        if (!active) return;
        headingTargets = [];
        document.querySelectorAll('main h1, main h2, main h3').forEach(function (el) {
            var isTerminal = el.id === 'terminal-heading';
            var first = true;
            el.childNodes.forEach(function (n) {
                if (n.nodeType !== 3) return;
                if (isTerminal && !first) {
                    // Clear typed text directly — _terminalRestart handles restoration
                    n.nodeValue = '';
                    return;
                }
                headingTargets.push({ node: n, original: n.nodeValue });
                if (first && n.nodeValue.trim().length > 1) {
                    encodeAnimate(n, n.nodeValue);
                    first = false;
                } else {
                    n.nodeValue = '';
                }
            });
        });
    }

    function restoreHeadings() {
        headingTargets.forEach(function (t) { t.node.nodeValue = t.original; });
        headingTargets = [];
    }

    function startHackerText() {
        textTargets = [];
        // Decode animation on paragraphs
        Array.from(document.querySelectorAll('main p')).slice(0, 6).forEach(function (el) {
            var node = firstTextNode(el);
            if (!node) return;
            textTargets.push({ node: node, original: node.nodeValue });
            decodeAnimate(node, node.nodeValue);
        });

        // Also include nav links in glitch pool
        document.querySelectorAll('nav ul li a').forEach(function (el) {
            var node = firstTextNode(el);
            if (!node) return;
            textTargets.push({ node: node, original: node.nodeValue });
        });

        // Binary-encode headings after the initial theme flash settles
        encodeTimer = setTimeout(encodeHeadings, 300);

        // Ambient idle glitch — random timing, occasional multi-char bursts
        (function scheduleGlitch() {
            if (!active) return;
            glitchTimer = setTimeout(function () {
                if (!active || !textTargets.length) return;
                var t = textTargets[Math.floor(Math.random() * textTargets.length)];
                var node = t.node;
                var orig = t.original;
                var arr = orig.split('');
                var pool = arr.reduce(function (a, ch, i) { if (ch !== ' ' && ch !== '\n') a.push(i); return a; }, []);
                if (!pool.length) { scheduleGlitch(); return; }

                // 25% chance of a 2–4 char burst, otherwise single char
                var count = Math.random() < 0.25 ? Math.floor(Math.random() * 3) + 2 : 1;
                var chosen = pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, count);
                var glitched = arr.slice();
                chosen.forEach(function (idx) { glitched[idx] = rndChar(); });
                node.nodeValue = glitched.join('');

                var holdMs = count > 1 ? 220 : 130;
                setTimeout(function () {
                    if (node.nodeValue !== orig) node.nodeValue = orig;
                }, holdMs);

                scheduleGlitch();
            }, 800 + Math.random() * 2400);
        })();
    }

    function stopHackerText() {
        clearTimeout(encodeTimer);
        encodeTimer = null;
        clearInterval(glitchTimer);
        glitchTimer = null;
        textTargets.forEach(function (t) { t.node.nodeValue = t.original; });
        textTargets = [];
        restoreHeadings();
        if (typeof window._terminalRestart === 'function') window._terminalRestart();
    }

    function setPdfViewerColorScheme(on) {
        document.querySelectorAll('.pdf-viewer').forEach(function (iframe) {
            iframe.style.colorScheme = on ? 'light' : '';
        });
    }

    function applyHacker(on) {
        active = on;
        document.body.classList.toggle('hacker-mode', on);
        var isDark = document.body.classList.contains('dark');
        document.documentElement.style.setProperty('--bg-color', on ? '#000' : isDark ? '#333' : '#fff');
        document.documentElement.style.setProperty('--text-color', on ? '#00ff41' : isDark ? '#fff' : '#333');
        setPdfViewerColorScheme(on);
        var toggle = document.getElementById('hacker-toggle');
        if (toggle) toggle.title = on ? 'Return' : '???';
        if (typeof drawAnalogClock === 'function') drawAnalogClock(new Date());
        if (typeof drawHackerClock === 'function') drawHackerClock(new Date());
        if (on) startHackerText();
        else stopHackerText();
    }

    // Init from localStorage — theme applied instantly, text effects delayed for full visibility
    if (localStorage.getItem('hackerMode') === 'true') {
        active = true;
        document.body.classList.add('hacker-mode');
        var isDark = document.body.classList.contains('dark');
        document.documentElement.style.setProperty('--bg-color', '#000');
        document.documentElement.style.setProperty('--text-color', '#00ff41');
        setPdfViewerColorScheme(true);
        var initToggle = document.getElementById('hacker-toggle');
        if (initToggle) initToggle.title = 'Return';
        if (typeof drawAnalogClock === 'function') drawAnalogClock(new Date());
        if (typeof drawHackerClock === 'function') drawHackerClock(new Date());
        setTimeout(startHackerText, 250);
    }

    var icon = document.getElementById('hacker-toggle');
    if (icon) {
        icon.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var on = !document.body.classList.contains('hacker-mode');
            applyHacker(on);
            localStorage.setItem('hackerMode', on ? 'true' : 'false');
        });
    }

    window.addEventListener('storage', function (e) {
        if (e.key === 'hackerMode') applyHacker(e.newValue === 'true');
    });
})();
