class Timer {
    #intervalSeconds;
    #secondsLeft;
    #onTick;
    #onEnd;
    #clockIntervalId;

    constructor(seconds, onTick, onEnd) {
        this.#intervalSeconds = seconds;
        this.#secondsLeft = seconds;
        this.#onTick = onTick;
        this.#onEnd = onEnd;
        this.#clockIntervalId = null;
    }

    get isRunning() {
        return !!this.#clockIntervalId;
    }

    get timeLeft() {
        return secondsToMinutesAndSeconds(this.#secondsLeft);
    }

    start() {
        this.#clockIntervalId = setInterval(() => {
            if (--this.#secondsLeft === 0) {
                clearInterval(this.#clockIntervalId);
                this.#clockIntervalId = null;
                this.#onEnd && this.#onEnd();
            } else {
                this.#onTick && this.#onTick();
            }
        }, 1000);
    }

    change(seconds) {
        this.#intervalSeconds = seconds;
        this.#secondsLeft = seconds;
    }

    reset() {
        clearInterval(this.#clockIntervalId);
        this.#clockIntervalId = null;
        this.change(this.#intervalSeconds);
    }

    pause() {
        clearInterval(this.#clockIntervalId);
        this.#clockIntervalId = null;
    }
}

export function startTimer(seconds, onTick, onEnd) {
    const timer = new Timer(seconds, onTick, onEnd);
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
