
const nameInput = document.getElementById("eventName");
const dateInput = document.getElementById("eventDate");
const addBtn = document.getElementById("addBtn");
const countdownList = document.getElementById("countdownList");
const eventCount = document.getElementById("eventCount");

let events = JSON.parse(localStorage.getItem("hourglassEvents")) || [];

function saveEvents() {
    localStorage.setItem("hourglassEvents", JSON.stringify(events));
}

function escapeHTML(text) {
    return text.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function addEvent() {
    const name = nameInput.value.trim();
    const date = new Date(dateInput.value);

    if (!name || !dateInput.value) {
        alert("Please enter event name and date.");
        return;
    }

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
        alert("Please select a future date and time.");
        return;
    }

    events.push({
        id: Date.now().toString(),
        name: name,
        date: date.getTime()
    });

    saveEvents();
    renderEvents();

    nameInput.value = "";
    dateInput.value = "";
}

function deleteEvent(id) {
    events = events.filter(event => event.id !== id);
    saveEvents();
    renderEvents();
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderEvents() {
    eventCount.textContent = `${events.length} events`;

    if (events.length === 0) {
        countdownList.innerHTML =
            '<div class="empty">No countdowns yet. Create your first one!</div>';
        return;
    }

    countdownList.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-name">${escapeHTML(event.name)}</div>

            <div class="timer" id="timer-${event.id}">
                00:00:00
            </div>

            <div class="timer-label">
                HOURS : MINUTES : SECONDS
            </div>

            <div class="event-date">
                Target: ${formatDate(event.date)}
            </div>

            <button class="delete-btn"
                onclick="deleteEvent('${event.id}')">
                Delete countdown
            </button>
        </div>
    `).join("");

    updateTimers();
}

function updateTimers() {
    const now = Date.now();

    events.forEach(event => {
        const timer = document.getElementById(`timer-${event.id}`);

        if (!timer) return;

        const difference = event.date - now;

        if (difference <= 0) {
            timer.textContent = "00:00:00";
            return;
        }

        const totalSeconds = Math.floor(difference / 1000);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        timer.textContent =
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;
    });
}

addBtn.addEventListener("click", addEvent);

renderEvents();
setInterval(updateTimers, 1000);
