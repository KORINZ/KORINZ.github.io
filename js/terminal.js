(function () {
    var style = document.createElement('style');
    style.textContent = '#terminal-heading .cursor{font-weight:normal;animation:cursor-blink 1s step-end infinite}@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}';
    document.head.appendChild(style);

    var el = document.getElementById('terminal-heading');
    var textNode = document.createTextNode('');
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '|';
    el.appendChild(textNode);
    el.appendChild(cursor);

    var TYPE_MS = 120, DELETE_MS = 55, PAUSE_TYPED = 4000, PAUSE_DELETED = 380;
    var loopTimer = null, running = false, lastGreeting = null;
    var isJa = document.documentElement.lang.startsWith('ja');

    function greetings() {
        var h = new Date().getHours();
        if (isJa) {
            var base = ['ハロー、ワールド！', 'いらっしゃいませ！', 'ようこそいらっしゃいました！',
                        '久しぶりの訪問ですね！', 'またのご訪問ありがとうございます！', 'いかがお過ごしですか？',
                        'ようこそ！', 'どうぞごゆっくり！', 'お越しいただきありがとうございます！'];
            var timed = h >= 5 && h < 12
                ? ['おはようございます！', '今日も良い一日を！']
                : h >= 12 && h < 17
                ? ['こんにちは！', 'ゆっくりしていってください！', '午後もお楽しみください！']
                : h >= 17 && h < 21
                ? ['こんばんは！', '良い夕べをお過ごしください！']
                : ['おやすみなさい！', 'ゆっくりお休みください！'];
        } else {
            var base = ['Hello, World!', 'Greetings!', 'Traveler Returns!', 'Long Time No See?!',
                        'Welcome Back!', 'Hello Again!', "What's Up?", 'Hey There!',
                        'Welcome!', 'Howdy!', 'Salutations!'];
            var timed = h >= 5 && h < 12
                ? ['Good Morning!', 'Rise and Shine!']
                : h >= 12 && h < 17
                ? ['Good Afternoon!', 'Hope Your Day Is Going Well!']
                : h >= 17 && h < 21
                ? ['Good Evening!', 'How Was Your Day?']
                : ['Good Night!', 'Burning the Midnight Oil?'];
        }
        return base.concat(timed);
    }

    function pick(exclude) {
        var pool = greetings().filter(function (g) { return g !== exclude; });
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function typeText(text, done) {
        var i = 0;
        window._terminalText = text;
        (function step() {
            if (!running || document.body.classList.contains('hacker-mode')) return;
            if (i < text.length) { textNode.nodeValue += text[i++]; loopTimer = setTimeout(step, TYPE_MS); }
            else { loopTimer = setTimeout(done, PAUSE_TYPED); }
        })();
    }

    function deleteText(done) {
        (function step() {
            if (!running || document.body.classList.contains('hacker-mode')) return;
            if (textNode.nodeValue.length > 0) { textNode.nodeValue = textNode.nodeValue.slice(0, -1); loopTimer = setTimeout(step, DELETE_MS); }
            else { loopTimer = setTimeout(done, PAUSE_DELETED); }
        })();
    }

    function loopNext() {
        if (!running || document.body.classList.contains('hacker-mode')) return;
        var g = pick(lastGreeting);
        lastGreeting = g;
        typeText(g, function () { deleteText(loopNext); });
    }

    function start() {
        running = true;
        textNode.nodeValue = '';
        lastGreeting = null;
        loopNext();
    }

    window._terminalRestart = function () {
        running = false;
        clearTimeout(loopTimer);
        textNode.nodeValue = '';
        setTimeout(start, 500);
    };
    window._terminalTypedNode = textNode;
    window._terminalText = '';

    setTimeout(start, 800);
})();
