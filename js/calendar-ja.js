let currentDay = null;

function drawHand(ctx, cx, cy, angle, length, width, color) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function drawHackerClock(date) {
    var canvas = document.getElementById('hacker-clock');
    if (!canvas) return;

    var SEGS = {
        '0': [1,1,1,1,1,1,0], '1': [0,1,1,0,0,0,0],
        '2': [1,1,0,1,1,0,1], '3': [1,1,1,1,0,0,1],
        '4': [0,1,1,0,0,1,1], '5': [1,0,1,1,0,1,1],
        '6': [1,0,1,1,1,1,1], '7': [1,1,1,0,0,0,0],
        '8': [1,1,1,1,1,1,1], '9': [1,1,1,1,0,1,1]
    };

    var dpr = window.devicePixelRatio || 1;
    var DW = 20, DH = 36, sw = 4, gap = 3, intraGap = 4, colonW = 8, PAD = 6;
    var totalW = 6 * DW + 2 * colonW + 4 * gap + 3 * intraGap;
    var W = totalW + PAD * 2, H = DH + PAD * 2;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);

    var ON = '#00ff41', OFF = 'rgba(0,255,65,0.1)';

    function drawSeg(segs, x, y) {
        var defs = [
            [x + sw, y, DW - 2*sw, sw, true],
            [x + DW - sw, y + sw, sw, DH/2 - 2*sw, false],
            [x + DW - sw, y + DH/2 + sw, sw, DH/2 - 2*sw, false],
            [x + sw, y + DH - sw, DW - 2*sw, sw, true],
            [x, y + DH/2 + sw, sw, DH/2 - 2*sw, false],
            [x, y + sw, sw, DH/2 - 2*sw, false],
            [x + sw, y + DH/2 - sw/2, DW - 2*sw, sw, true]
        ];
        for (var i = 0; i < 7; i++) {
            var on = segs[i] === 1;
            ctx.fillStyle = on ? ON : OFF;
            ctx.shadowColor = on ? ON : 'transparent';
            ctx.shadowBlur = on ? 6 : 0;
            ctx.fillRect(defs[i][0], defs[i][1], defs[i][2], defs[i][3]);
        }
    }

    function drawColon(x, y) {
        ctx.fillStyle = ON;
        ctx.shadowColor = ON;
        ctx.shadowBlur = 7;
        var r = sw * 0.55;
        ctx.beginPath();
        ctx.arc(x + colonW / 2, y + DH / 3, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + colonW / 2, y + DH * 2 / 3, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    var h = date.getHours().toString().padStart(2, '0');
    var m = date.getMinutes().toString().padStart(2, '0');
    var s = date.getSeconds().toString().padStart(2, '0');
    var ox = PAD, oy = PAD;

    drawSeg(SEGS[h[0]], ox, oy); ox += DW + intraGap;
    drawSeg(SEGS[h[1]], ox, oy); ox += DW + gap;
    drawColon(ox, oy); ox += colonW + gap;
    drawSeg(SEGS[m[0]], ox, oy); ox += DW + intraGap;
    drawSeg(SEGS[m[1]], ox, oy); ox += DW + gap;
    drawColon(ox, oy); ox += colonW + gap;
    drawSeg(SEGS[s[0]], ox, oy); ox += DW + intraGap;
    drawSeg(SEGS[s[1]], ox, oy);

    ctx.restore();
}

// Segmented "decrypting" progress bar shown while the digital clock boots up
function drawHackerLoadingBar(progress) {
    var canvas = document.getElementById('hacker-clock-loading');
    if (!canvas) return;

    var dpr = window.devicePixelRatio || 1;
    var W = 172, H = 48;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    var ON = '#00ff41', OFF = 'rgba(0,255,65,0.12)';
    var barW = W - 28, barH = 10, bx = (W - barW) / 2, by = H / 2 - barH / 2 - 3;

    ctx.strokeStyle = ON;
    ctx.shadowColor = ON;
    ctx.shadowBlur = 4;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 0.5, by + 0.5, barW - 1, barH - 1);

    var segs = 18, segGap = 2;
    var segW = (barW - 4 - (segs - 1) * segGap) / segs;
    var filled = Math.round(progress * segs);
    for (var i = 0; i < segs; i++) {
        var on = i < filled;
        ctx.fillStyle = on ? ON : OFF;
        ctx.shadowColor = on ? ON : 'transparent';
        ctx.shadowBlur = on ? 6 : 0;
        ctx.fillRect(bx + 2 + i * (segW + segGap), by + 2, segW, barH - 4);
    }

    ctx.shadowColor = ON;
    ctx.shadowBlur = 4;
    ctx.fillStyle = ON;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('DECRYPTING TIME ' + Math.floor(progress * 100) + '%', W / 2, by + barH + 14);

    ctx.restore();
}

var hackerBootRAF = null;

// Hold on the loading bar for ~5s before revealing the digital clock
function startHackerClockBoot() {
    if (hackerBootRAF) cancelAnimationFrame(hackerBootRAF);
    document.body.classList.remove('hacker-clock-ready');

    var DURATION = 5000, start = null;
    function frame(ts) {
        if (!document.body.classList.contains('hacker-mode')) { hackerBootRAF = null; return; }
        if (!start) start = ts;
        var p = Math.min((ts - start) / DURATION, 1);
        drawHackerLoadingBar(p);
        if (p < 1) {
            hackerBootRAF = requestAnimationFrame(frame);
        } else {
            hackerBootRAF = null;
            document.body.classList.add('hacker-clock-ready');
            localStorage.setItem('hackerClockBooted', 'true');
            drawHackerClock(new Date());
        }
    }
    hackerBootRAF = requestAnimationFrame(frame);
}

function showHackerClockInstantly() {
    if (hackerBootRAF) { cancelAnimationFrame(hackerBootRAF); hackerBootRAF = null; }
    document.body.classList.add('hacker-clock-ready');
    drawHackerClock(new Date());
}

// Plays the boot animation only the first time hacker mode is entered —
// navigating between pages while it stays on shows the clock immediately.
function revealHackerClock() {
    if (localStorage.getItem('hackerClockBooted') === 'true') showHackerClockInstantly();
    else startHackerClockBoot();
}

function stopHackerClockBoot() {
    if (hackerBootRAF) { cancelAnimationFrame(hackerBootRAF); hackerBootRAF = null; }
    document.body.classList.remove('hacker-clock-ready');
    localStorage.removeItem('hackerClockBooted');
}

function drawAnalogClock(date) {
    let canvas = document.getElementById('analog-clock');
    if (!canvas) return;
    let ctx = canvas.getContext('2d');
    let isDark = document.body.classList.contains('dark');
    let isHacker = document.body.classList.contains('hacker-mode');

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.width / dpr;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = isHacker ? '#000' : isDark ? '#2a2a2a' : '#fff';
    ctx.fill();
    ctx.strokeStyle = isHacker ? '#00ff41' : isDark ? '#aaa' : '#333';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
        let angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        let isHour = i % 3 === 0;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (r - (isHour ? 9 : 5)), cy + Math.sin(angle) * (r - (isHour ? 9 : 5)));
        ctx.lineTo(cx + Math.cos(angle) * (r - 2), cy + Math.sin(angle) * (r - 2));
        ctx.strokeStyle = isHacker ? '#00ff41' : isDark ? '#aaa' : '#333';
        ctx.lineWidth = isHour ? 2.5 : 1.5;
        ctx.stroke();
    }

    let hours = date.getHours() % 12;
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    let handClr = isHacker ? '#00ff41' : isDark ? '#eee' : '#333';
    drawHand(ctx, cx, cy, ((hours + minutes / 60) / 12) * 2 * Math.PI - Math.PI / 2, r * 0.5, 4, handClr);
    drawHand(ctx, cx, cy, ((minutes + seconds / 60) / 60) * 2 * Math.PI - Math.PI / 2, r * 0.72, 3, handClr);
    drawHand(ctx, cx, cy, (seconds / 60) * 2 * Math.PI - Math.PI / 2, r * 0.83, 1.5, isHacker ? '#39ff14' : '#e74c3c');

    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = isHacker ? '#00ff41' : isDark ? '#eee' : '#333';
    ctx.fill();
    ctx.restore();
}

function createCalendar() {
    // Clear any existing calendar first
    let calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';
    // Get the current date.
    let date = new Date();
    currentDay = date.getDate();

    // Create analog clock canvas above the calendar table
    let clockCanvas = document.createElement('canvas');
    clockCanvas.id = 'analog-clock';
    let clockDpr = window.devicePixelRatio || 1;
    clockCanvas.width = 100 * clockDpr;
    clockCanvas.height = 100 * clockDpr;
    clockCanvas.style.cssText = 'display:block;margin:4px auto 6px auto;width:100px;height:100px;';
    calendarDiv.appendChild(clockCanvas);

    // Create hacker-mode 7-segment clock canvas (shown only in hacker mode)
    let hackerClockCanvas = document.createElement('canvas');
    hackerClockCanvas.id = 'hacker-clock';
    hackerClockCanvas.style.cssText = 'display:none;margin:6px auto 2px;';
    calendarDiv.appendChild(hackerClockCanvas);

    // Create hacker-mode "decrypting" progress bar canvas (briefly shown before the clock)
    let hackerLoadingCanvas = document.createElement('canvas');
    hackerLoadingCanvas.id = 'hacker-clock-loading';
    hackerLoadingCanvas.style.cssText = 'display:none;margin:6px auto 2px;';
    calendarDiv.appendChild(hackerLoadingCanvas);

    // Create a table for the calendar.
    let calendarTable = document.createElement('table');

    // Add time and timezone at the top of the calendar
    let timeRow = document.createElement('tr');
    timeRow.id = 'time-row';
    let timeCell = document.createElement('th');

    timeCell.setAttribute('id', 'time'); // give the time cell an ID so we can update it later
    timeCell.setAttribute('colspan', '7'); // span all seven columns
    timeRow.appendChild(timeCell);
    calendarTable.appendChild(timeRow);

    // Add year and month at the top of the calendar
    let monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    let yearMonthRow = document.createElement('tr');
    let yearMonthCell = document.createElement('th');
    const year = date.getFullYear();
    const era = year - 2018;
    yearMonthCell.textContent = year + '年' + ` (令和${era}年) ` + monthNames[date.getMonth()];
    yearMonthCell.setAttribute('colspan', '7'); // span all seven columns
    yearMonthRow.appendChild(yearMonthCell);
    calendarTable.appendChild(yearMonthRow);

    // Add table header for the days of the week.
    let days = ['日', '月', '火', '水', '木', '金', '土'];
    let headerRow = document.createElement('tr');
    for (let day of days) {
        let headerCell = document.createElement('th');
        headerCell.innerHTML = '&nbsp;&#8202;&#8202;' + day + '&nbsp;&#8202;&#8202;'; // Add two non-breaking spaces around the day
        headerRow.appendChild(headerCell);
    }
    calendarTable.appendChild(headerRow);



    // Get the first day of the month.
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    // Get the number of days in the month.
    let numDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Add days of the month to the table.
    let day = 1;
    for (let i = 0; i < 6; i++) { // for each week
        let row = document.createElement('tr');
        for (let j = 0; j < 7; j++) { // for each day
            let cell = document.createElement('td');
            if ((i === 0 && j < firstDay) || day > numDays) {
                // If the cell is before the start of the month or after the end, leave it empty.
                cell.textContent = '';
            } else {
                cell.textContent = day;
                // If the day matches the current day, add a CSS class to highlight it.
                if (day === date.getDate()) {
                    cell.classList.add('today');
                }
                day++;
            }
            row.appendChild(cell);
        }
        calendarTable.appendChild(row);
    }

    // Append the table to the calendar div.
    calendarDiv.appendChild(calendarTable);

    // Update the time immediately, then every second.
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    // Get the current date.
    let date = new Date();
    if (date.getDate() !== currentDay) {
        setTimeout(createCalendar, 2000); // delay of 2 seconds
    }

    // Get the time cell.
    let timeCell = document.getElementById('time');

    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');

    // Get timezone offset in hours.
    let timezoneOffset = date.getTimezoneOffset() / 60;

    // Format timezone offset.
    let timezoneString = '';
    if (timezoneOffset < 0) {
        timezoneString = `UTC+${Math.abs(timezoneOffset)}:00`;
    } else if (timezoneOffset > 0) {
        timezoneString = `UTC-${Math.abs(timezoneOffset)}:00`;
    } else {
        timezoneString = 'UTC';
    }

    timeCell.textContent = `${hours}:${minutes}:${seconds} (${timezoneString})`;
    drawAnalogClock(date);
    drawHackerClock(date);
}

// Call the function to create the calendar.
createCalendar();
