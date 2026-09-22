import {
    type TimeRemaining,
    secondsToMinutesAndSeconds,
    startTimer,
} from "./clock.ts";
import { isBreakNext, statusLabels } from "./status.ts";
import {
    type Member,
    adjustTeamSize,
    canDrive,
    canMarkAway,
    getActiveMember,
    shuffleTeam,
    switchActiveMember,
    whosNext,
    whosNextAfter,
} from "./team.ts";

export type SessionStatus = "idle" | "running" | "paused";

export type SessionState = {
    team: Array<Member>;
    intervalSeconds: number;
    takeBreaks: boolean;
    onBreak: boolean;
    timeRemaining: TimeRemaining;
    status: SessionStatus;
};

export type SessionOptions = {
    team: Array<Member>;
    intervalSeconds: number;
    takeBreaks?: boolean;
};

export type SessionEvents = {
    // any change, including every tick
    onChange?: (state: SessionState) => void;
    // a driver's turn or a break ran out
    onTurnEnd?: (state: SessionState) => void;
};

export type Session = ReturnType<typeof createSession>;

// team is mutated in place, so a reactive array stays reactive
export function createSession(
    { team, intervalSeconds, takeBreaks = true }: SessionOptions,
    { onChange, onTurnEnd }: SessionEvents = {}
) {
    let timer: ReturnType<typeof startTimer> | null = null;
    let isPaused = false;
    let onBreak = false;
    let timeRemaining = secondsToMinutesAndSeconds(intervalSeconds);

    function getState(): SessionState {
        return {
            team,
            intervalSeconds,
            takeBreaks,
            onBreak,
            timeRemaining,
            status: timer?.isRunning ? "running" : isPaused ? "paused" : "idle",
        };
    }

    function changed() {
        onChange?.(getState());
    }

    function resetTimeRemaining() {
        timeRemaining = secondsToMinutesAndSeconds(intervalSeconds);
    }

    function stopTurn() {
        timer?.reset();
        timer = null;
        isPaused = false;
        resetTimeRemaining();
    }

    function onTick(timeLeft: TimeRemaining) {
        timeRemaining = timeLeft;
        changed();
    }

    function onEnd() {
        if (isBreakNext({ team, onBreak, takeBreaks })) {
            onBreak = true;
            resetTimeRemaining();
            timer = startTimer(intervalSeconds, onTick, onEnd);
            changed();
        } else {
            endBreak();
        }

        onTurnEnd?.(getState());
    }

    // returns whether a new turn was started
    function start() {
        if (isPaused || timer?.isRunning) return false;

        timer = startTimer(intervalSeconds, onTick, onEnd);
        isPaused = false;
        changed();
        return true;
    }

    function togglePause() {
        if (!timer) return;

        if (timer.isRunning) {
            timer.pause();
            isPaused = true;
        } else if (isPaused) {
            timer.start();
            isPaused = false;
        }
        changed();
    }

    // start, pause or resume, like a single start/pause button
    function toggle() {
        if (!timer) return start();

        togglePause();
        return false;
    }

    function endBreak() {
        onBreak = false;
        stopTurn();
        switchActiveMember(whosNext(team).index, team);
        changed();
    }

    function switchDriver(index: number) {
        if (!canDrive(index, team)) return;

        stopTurn();
        switchActiveMember(index, team);
        changed();
    }

    function setMemberHere(index: number, isHere: boolean) {
        if (!isHere && !canMarkAway(index, team)) return;

        const activeMember = getActiveMember(team);
        team[index].isHere = isHere;

        if (activeMember.index === index && !isHere) {
            stopTurn();
            switchActiveMember(
                whosNextAfter(activeMember.index, team).index,
                team
            );
        }
        changed();
    }

    function renameMember(index: number, name: string) {
        team[index].name = name;
        changed();
    }

    function setTeamSize(size: number) {
        adjustTeamSize(team, size);
        changed();
    }

    function shuffle() {
        shuffleTeam(team);
        changed();
    }

    function setInterval(seconds: number) {
        intervalSeconds = seconds;
        timer?.change(intervalSeconds);
        resetTimeRemaining();
        changed();
    }

    function setTakeBreaks(value: boolean) {
        takeBreaks = value;
        changed();
    }

    return {
        get state() {
            return getState();
        },
        labels: () => statusLabels(getState()),
        start,
        togglePause,
        toggle,
        endBreak,
        switchDriver,
        setMemberHere,
        renameMember,
        setTeamSize,
        shuffle,
        setInterval,
        setTakeBreaks,
    };
}
