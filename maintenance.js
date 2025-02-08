document.addEventListener('DOMContentLoaded', () => {
    const maintenancePopup = document.getElementById('maintenance-popup');
    const closeBtn = document.getElementById('close-btn');
    const overridePassword = "Noah";  // Correct password to bypass the popup

    function isMaintenanceTime() {
        const now = new Date();
        const estOffset = -5 * 60;  // EST is UTC-5
        const estDate = new Date(now.getTime() + (now.getTimezoneOffset() + estOffset) * 60000);
        const hours = estDate.getHours();
        const minutes = estDate.getMinutes();

        // Maintenance Windows
        const maintenanceWindows = [
            { start: { hour: 3, minute: 0 }, duration: 30 },   // 3:00 AM – 3:30 AM EST
            { start: { hour: 10, minute: 0 }, duration: 30 },  // 10:00 AM – 10:30 AM EST
            { start: { hour: 17, minute: 30 }, duration: 30 }, // 5:30 PM – 6:00 PM EST
            { start: { hour: 22, minute: 15 }, duration: 30 }, // 10:15 PM – 10:45 PM EST
            { start: { hour: 23, minute: 30 }, duration: 30 }  // 11:30 PM – 12:00 AM EST
        ];

        for (const window of maintenanceWindows) {
            const startTime = window.start.hour * 60 + window.start.minute;
            const endTime = startTime + window.duration;
            const currentTime = hours * 60 + minutes;

            if (currentTime >= startTime && currentTime <= endTime) {
                return true;  // Within a maintenance window
            }
        }

        return false;
    }

    if (isMaintenanceTime()) {
        maintenancePopup.style.display = 'flex';
    }

    closeBtn.addEventListener('click', () => {
        const userPassword = prompt("Enter the password to access the site:");
        if (userPassword === overridePassword) {
            alert("Access granted.");
            maintenancePopup.style.display = 'none';
        } else {
            alert("Incorrect password. Access denied.");
        }
    });
});
