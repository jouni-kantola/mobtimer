import { type TimeRemaining, formatTime } from "./clock.ts";
import { type Member, getActiveMember, getLast, whosNext } from "./team.ts";

export type MobStatus = {
    team: Array<Member>;
    onBreak: boolean;
    takeBreaks: boolean;
    timeRemaining: TimeRemaining;
};

export type StatusLabels = {
    now: string;
    next: string;
    timeLeft: string;
};

export function isBreakNext({
    team,
    onBreak,
    takeBreaks,
}: Omit<MobStatus, "timeRemaining">) {
    return (
        takeBreaks &&
        getLast(team).index == getActiveMember(team).index &&
        !onBreak
    );
}

export function statusLabels(status: MobStatus): StatusLabels {
    return {
        now: status.onBreak ? "Break" : getActiveMember(status.team).name,
        next: isBreakNext(status) ? "Break" : whosNext(status.team).name,
        timeLeft: formatTime(status.timeRemaining),
    };
}
