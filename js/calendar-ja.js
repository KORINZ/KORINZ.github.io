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

function drawAnalogClock(date) {
    let canvas = document.getElementById('analog-clock');
    if (!canvas) return;
    let ctx = canvas.getContext('2d');
    let isDark = document.body.classList.contains('dark');
    let isHacker = document.body.classList.contains('hacker-mode');

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

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
    clockCanvas.width = 100;
    clockCanvas.height = 100;
    clockCanvas.style.cssText = 'display:block;margin:4px auto 6px auto;';
    calendarDiv.appendChild(clockCanvas);

    // Create a table for the calendar.
    let calendarTable = document.createElement('table');

    // Add time and timezone at the top of the calendar
    let timeRow = document.createElement('tr');
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
}

// Call the function to create the calendar.
createCalendar();
