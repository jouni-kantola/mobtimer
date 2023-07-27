class Timer {
    #intervalSeconds: number;
    #secondsLeft: number;
    #onTick: () => void;
    #onEnd: () => void;
    #clockIntervalId: NodeJS.Timeout | null;

    constructor(seconds: number, onTick: () => void, onEnd: () => void) {
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
                this.#clearInterval();
                !!this.#onEnd && this.#onEnd();
            } else {
                !!this.#onTick && this.#onTick();
            }
        }, 1000);
    }

    change(seconds: number) {
        this.#intervalSeconds = seconds;
        this.#secondsLeft = seconds;
    }

    reset() {
        this.#clearInterval();
        this.change(this.#intervalSeconds);
    }

    pause() {
        this.#clearInterval();
    }

    #clearInterval() {
        !!this.#clockIntervalId && clearInterval(this.#clockIntervalId);
        this.#clockIntervalId = null;
    }
}

export function startTimer(seconds: number, onTick: () => void, onEnd: () => void) {
    const timer = new Timer(seconds, onTick, onEnd);
    timer.start();
    return timer;
}

export function secondsToMinutesAndSeconds(value: number) {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}`;
    return formattedTime;
}
