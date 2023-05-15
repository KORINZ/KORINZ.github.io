function createCalendar() {
    // Clear any existing calendar first
    let calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';
    // Get the current date.
    let date = new Date();

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
        headerCell.innerHTML = '&nbsp;&nbsp;' + day + '&nbsp;&nbsp;'; // Add two non-breaking spaces around the day
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

    // Check if it's midnight and if so, update the calendar.
    if (hours === '00' && minutes === '00' && seconds === '00') {
        createCalendar();
    }
}

// Call the function to create the calendar.
createCalendar();