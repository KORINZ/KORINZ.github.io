(function () {
    var GLITCH = '!@#$%^&*<>[]{}|/\\01~`;:.?';
    var active = false;
    var encodeTimer = null;  // guards the delayed encodeHeadings call
    var textTargets = [];       // paragraphs: [{node, original}]
    var headingTargets = [];    // headings:   [{node, original}]
    var sidebarTargets = [];    // sidebar links: [{node, original}]
    var figcaptionTargets = []; // figcaptions: [{node, original}]
    var listTargets = [];       // list items: [{node, original}]

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

    // Recursively collect all text nodes inside inline elements, skipping <a> to preserve URLs.
    var SKIP_INLINE = { A: 1, SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1 };
    function collectInlineTextNodes(el) {
        var nodes = [];
        el.childNodes.forEach(function (n) {
            if (n.nodeType === 3 && n.nodeValue.trim().length > 1) {
                nodes.push(n);
            } else if (n.nodeType === 1 && !SKIP_INLINE[n.tagName]) {
                nodes = nodes.concat(collectInlineTextNodes(n));
            }
        });
        return nodes;
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
            if (!active) { return; }
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
            if (!active) { return; }
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

            if (isTerminal) {
                // Combine all text nodes so ">>> Hello, World!" encodes together
                var textNodes = [];
                var combined = '';
                el.childNodes.forEach(function (n) {
                    if (n.nodeType !== 3) return;
                    textNodes.push({ node: n, original: n.nodeValue });
                    // Always use the full terminal text for the typed node — the typing
                    // animation may be mid-flight or blocked in hacker mode.
                    var val = (n === window._terminalTypedNode && window._terminalText)
                              ? window._terminalText : n.nodeValue;
                    combined += val;
                });
                if (textNodes.length > 0 && combined.trim().length > 1) {
                    textNodes[0].node.nodeValue = combined;
                    for (var i = 1; i < textNodes.length; i++) textNodes[i].node.nodeValue = '';
                    headingTargets = headingTargets.concat(textNodes);
                    encodeAnimate(textNodes[0].node, combined);
                }
                return;
            }

            var first = true;
            el.childNodes.forEach(function (n) {
                if (n.nodeType !== 3) return;
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

        // Decode animation on figcaptions (all inline text nodes, including inside <strong>/<i>/<b>)
        figcaptionTargets = [];
        document.querySelectorAll('main figcaption').forEach(function (el) {
            collectInlineTextNodes(el).forEach(function (node) {
                figcaptionTargets.push({ node: node, original: node.nodeValue });
                decodeAnimate(node, node.nodeValue);
            });
        });

        // Decode animation on list items (all inline text nodes, skipping <a> URL text)
        listTargets = [];
        document.querySelectorAll('main li').forEach(function (el) {
            collectInlineTextNodes(el).forEach(function (node) {
                listTargets.push({ node: node, original: node.nodeValue });
                decodeAnimate(node, node.nodeValue);
            });
        });

        // Binary-encode headings after the initial theme flash settles
        encodeTimer = setTimeout(encodeHeadings, 300);

        startSidebarGlitch();
    }

    function startSidebarGlitch() {
        sidebarTargets = [];
        document.querySelectorAll('aside h1 a, aside .social-links a, aside nav ul a').forEach(function (el) {
            var node = firstTextNode(el);
            if (!node) return;
            sidebarTargets.push({ node: node, original: node.nodeValue });
            decodeAnimate(node, node.nodeValue);
        });
    }

    function stopSidebarGlitch() {
        sidebarTargets.forEach(function (t) { t.node.nodeValue = t.original; });
        sidebarTargets = [];
    }

    function stopHackerText() {
        clearTimeout(encodeTimer);
        encodeTimer = null;
        textTargets.forEach(function (t) { t.node.nodeValue = t.original; });
        textTargets = [];
        figcaptionTargets.forEach(function (t) { t.node.nodeValue = t.original; });
        figcaptionTargets = [];
        listTargets.forEach(function (t) { t.node.nodeValue = t.original; });
        listTargets = [];
        restoreHeadings();
        stopSidebarGlitch();
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
        // On touch devices, blur the icon after tap so the synthetic :hover doesn't stick
        icon.addEventListener('touchend', function () {
            this.blur();
            document.activeElement && document.activeElement.blur();
        });

        // Randomly fire wiggle or flip every 8–15 s
        function fireRandomAction() {
            var isFlip = Math.random() < 0.5;
            var dur    = isFlip ? 800 : 650;
            var anim   = isFlip ? 'hacker-toggle-flip' : 'hacker-toggle-wiggle';
            icon.style.animation = 'hacker-toggle-breathe 3s ease-in-out infinite, ' +
                                    anim + ' ' + (dur / 1000) + 's ease-in-out 1';
            setTimeout(function () {
                icon.style.animation = '';
                setTimeout(fireRandomAction, 8000 + Math.random() * 7000);
            }, dur + 150);
        }
        setTimeout(fireRandomAction, 3000 + Math.random() * 5000);
    }

    window.addEventListener('storage', function (e) {
        if (e.key === 'hackerMode') applyHacker(e.newValue === 'true');
    });
})();
