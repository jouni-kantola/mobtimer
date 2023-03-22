let secondsLeft = 0;
let clockIntervalId = null;

const timer = new (class {
    get isRunning() {
        return clockIntervalId !== null;
    }
})();

export function startTimer(seconds) {
    secondsLeft = seconds;
    clockIntervalId = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            clearInterval(clockIntervalId);
            clockIntervalId = null;
        }
    }, 1000);

    return timer;
}

export function secondsToMinutesAndSeconds(value) {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}`;
    return formattedTime;
}
