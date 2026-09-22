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

export function formatTime([minutes, seconds]: TimeRemaining) {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
    )}`;
}

export function toIntervalSeconds(minutes: number, seconds: number) {
    return minutes * 60 + seconds || 1;
}

// accepts "600", "90s", "10m", "1m30s" and "10:00"
export function parseInterval(value: string): number | undefined {
    const text = value.trim().toLowerCase();

    const clock = text.match(/^(\d+):([0-5]?\d)$/);
    if (clock) return toIntervalSeconds(Number(clock[1]), Number(clock[2]));

    const units = text.match(/^(?:(\d+)m)?(?:(\d+)s?)?$/);
    if (units && (units[1] || units[2]))
        return toIntervalSeconds(Number(units[1] ?? 0), Number(units[2] ?? 0));

    return undefined;
}
