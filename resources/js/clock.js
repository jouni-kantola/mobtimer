class Timer {
    #secondsLeft;
    #onTick;
    #clockIntervalId;

    constructor(seconds, onTick) {
        this.#secondsLeft = seconds;
        this.#onTick = onTick;
        this.#clockIntervalId = null;
    }

    get isRunning() {
        return !!this.#clockIntervalId;
    }

    start() {
        this.#clockIntervalId = setInterval(() => {
            if (--this.#secondsLeft < 0) {
                clearInterval(this.#clockIntervalId);
                this.#clockIntervalId = null;
            } else {
                this.#onTick && this.#onTick();
            }
        }, 1000);
    }
}

export function startTimer(seconds, onTick) {
    const timer = new Timer(seconds, onTick);
    timer.start();
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
