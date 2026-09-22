export type TimeRemaining = [number, number];

class Timer {
    private intervalSeconds: number;
    private secondsLeft: number;
    private endsAt: number;
    private onTick: (timeLeft: TimeRemaining) => void;
    private onEnd: () => void;
    private clockIntervalId: NodeJS.Timeout | null;

    constructor(
        seconds: number,
        onTick: (timeLeft: TimeRemaining) => void,
        onEnd: () => void
    ) {
        this.intervalSeconds = seconds;
        this.secondsLeft = seconds;
        this.endsAt = 0;
        this.onTick = onTick;
        this.onEnd = onEnd;
        this.clockIntervalId = null;
    }

    get isRunning() {
        return !!this.clockIntervalId;
    }

    get timeLeft() {
        return secondsToMinutesAndSeconds(this.secondsLeft);
    }

    start() {
        if (this.isRunning) return;

        this.restartCountdown();
        this.clockIntervalId = setInterval(() => {
            // based on wall clock so drift and sleep don't delay the end
            this.secondsLeft = Math.max(
                0,
                Math.round((this.endsAt - Date.now()) / 1000)
            );

            if (this.secondsLeft === 0) {
                this.clearInterval();
                !!this.onEnd && this.onEnd();
            } else {
                !!this.onTick && this.onTick(this.timeLeft);
            }
        }, 1000);
    }

    change(seconds: number) {
        this.intervalSeconds = seconds;
        this.secondsLeft = seconds;
        this.restartCountdown();
    }

    reset() {
        this.clearInterval();
        this.change(this.intervalSeconds);
    }

    pause() {
        this.clearInterval();
    }

    clearInterval() {
        !!this.clockIntervalId && clearInterval(this.clockIntervalId);
        this.clockIntervalId = null;
    }

    private restartCountdown() {
        this.endsAt = Date.now() + this.secondsLeft * 1000;
    }
}

export function startTimer(
    seconds: number,
    onTick: (timeLeft: TimeRemaining) => void,
    onEnd: () => void
) {
    const timer = new Timer(seconds, onTick, onEnd);
    timer.start();
    return timer;
}

export function secondsToMinutesAndSeconds(value: number): TimeRemaining {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return [minutes, seconds];
}
