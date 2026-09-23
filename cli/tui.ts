import { emitKeypressEvents } from "node:readline";
import {
    type Session,
    type SessionOptions,
    type SessionState,
    createSession,
} from "../lib/session.ts";
import { type StatusLabels, nextLine, nowLine } from "../lib/status.ts";
import { whosNext, whosPrevious } from "../lib/team.ts";
import type { Notifier } from "./notify.ts";

export type Key = { name?: string; sequence?: string; ctrl?: boolean };

export type Style = {
    bold: (text: string) => string;
    dim: (text: string) => string;
    inverse: (text: string) => string;
};

const ansi = (code: string, reset: string) => (text: string) =>
    `\x1b[${code}m${text}\x1b[${reset}m`;

export const colors: Style = {
    bold: ansi("1", "22"),
    dim: ansi("2", "22"),
    inverse: ansi("7", "27"),
};

export const plain: Style = {
    bold: text => text,
    dim: text => text,
    inverse: text => text,
};

const statusText = {
    idle: "Ready",
    running: "Running",
    paused: "Paused",
};

export const keyHints =
    "enter start · space start/pause · n/↓ next · ↑ previous · b skip/toggle breaks · 1-9 driver · a away · r rename · s shuffle · </> team size · +/- interval · q quit";

export function renderScreen(
    state: SessionState,
    labels: StatusLabels,
    { style = plain, message = "" }: { style?: Style; message?: string } = {}
) {
    const status = state.onBreak ? "Break" : statusText[state.status];

    const members = state.team.map(member => {
        const number = member.index < 9 ? `${member.index + 1}` : " ";
        const marker = member.isActive ? "▶" : " ";
        const line = `${number} ${marker} ${member.name}`;

        if (!member.isHere) return style.dim(`${line} (away)`);
        if (member.isActive) return style.bold(line);
        return line;
    });

    return [
        "",
        `  ${style.inverse(` ${labels.timeLeft} `)}  ${style.bold(status)}${state.takeBreaks ? "" : style.dim("  (no breaks)")}`,
        "",
        `  ${nowLine(labels)}`,
        `  ${nextLine(labels)}`,
        "",
        ...members.map(line => `  ${line}`),
        "",
        `  ${style.dim(message || keyHints)}`,
    ];
}

export type KeyActions = {
    quit: () => void;
    saveMembers: (members: string[]) => void;
    saveInterval: (seconds: number) => void;
    // shown in place of the key hints until the next key
    say: (message: string) => void;
};

export function createKeyHandler(session: Session, actions: KeyActions) {
    let awaitingNumber: "away" | "rename" | undefined;
    let renaming: { index: number; name: string } | undefined;

    const saveMembers = () =>
        actions.saveMembers(session.state.team.map(m => m.name));

    const sayRenaming = ({ index, name }: { index: number; name: string }) =>
        actions.say(
            `Rename ${session.state.team[index].name}: ${name}_  (enter save · esc cancel)`
        );

    function editName(key: Key, edit: { index: number; name: string }) {
        switch (key.name) {
            case "return":
            case "enter": {
                renaming = undefined;
                const name = edit.name.trim();
                if (name) {
                    session.renameMember(edit.index, name);
                    saveMembers();
                }
                return actions.say("");
            }
            case "escape":
                renaming = undefined;
                return actions.say("");
            case "backspace":
                edit.name = [...edit.name].slice(0, -1).join("");
                return sayRenaming(edit);
        }

        const text = key.sequence ?? "";
        if (!key.ctrl && [...text].length === 1 && text >= " ") {
            edit.name += text;
            sayRenaming(edit);
        }
    }

    return (key: Key) => {
        if (key.ctrl && key.name === "c") return actions.quit();

        if (renaming) return editName(key, renaming);

        const memberNumber = /^[1-9]$/.test(key.sequence ?? "")
            ? Number(key.sequence) - 1
            : undefined;

        if (awaitingNumber) {
            const awaiting = awaitingNumber;
            awaitingNumber = undefined;
            const member = session.state.team[memberNumber ?? -1];
            if (!member) return actions.say("");

            if (awaiting === "away") {
                session.setMemberHere(member.index, !member.isHere);
                return actions.say("");
            }

            renaming = { index: member.index, name: member.name };
            return sayRenaming(renaming);
        }

        if (memberNumber !== undefined) {
            session.switchDriver(memberNumber);
            return actions.say("");
        }

        switch (key.name ?? key.sequence) {
            case "q":
            case "escape":
                return actions.quit();
            case "space":
                session.toggle();
                return actions.say("");
            case "return":
            case "enter":
                session.start();
                return actions.say("");
            case "n":
            case "down":
                session.switchDriver(whosNext(session.state.team).index);
                return actions.say("");
            case "up":
                session.switchDriver(whosPrevious(session.state.team).index);
                return actions.say("");
            case "b":
                if (session.state.onBreak) session.endBreak();
                else session.setTakeBreaks(!session.state.takeBreaks);
                return actions.say("");
            case "a":
                awaitingNumber = "away";
                return actions.say("Toggle away: press member number 1-9");
            case "r":
                awaitingNumber = "rename";
                return actions.say("Rename: press member number 1-9");
            case "s":
                session.shuffle();
                saveMembers();
                return actions.say("");
        }

        switch (key.sequence) {
            case ">":
            case "<": {
                const change = key.sequence === "<" ? -1 : 1;
                session.setTeamSize(session.state.team.length + change);
                saveMembers();
                return actions.say("");
            }
            case "+":
            case "=":
            case "-": {
                const change = key.sequence === "-" ? -60 : 60;
                const seconds = Math.max(
                    60,
                    session.state.intervalSeconds + change
                );
                session.setInterval(seconds);
                actions.saveInterval(seconds);
                return actions.say("");
            }
        }
    };
}

export type TuiOptions = SessionOptions & {
    notify?: Notifier;
    saveMembers: (members: string[]) => void;
    saveInterval: (seconds: number) => void;
    stdin?: NodeJS.ReadStream;
    stdout?: NodeJS.WriteStream;
};

// resolves when the user quits
export function runTui({
    notify,
    saveMembers,
    saveInterval,
    stdin = process.stdin,
    stdout = process.stdout,
    ...sessionOptions
}: TuiOptions) {
    const style = process.env.NO_COLOR ? plain : colors;
    let message = "";

    const session = createSession(sessionOptions, {
        onChange: () => draw(),
        onTurnEnd: state => {
            const { now } = session.labels();
            notify?.(
                "Mob timer",
                state.onBreak ? "Time for a break" : `${now}'s turn`
            );
        },
    });

    function draw() {
        const lines = renderScreen(session.state, session.labels(), {
            style,
            message,
        });
        // home, overwrite each line, clear the rest of the screen
        stdout.write(
            "\x1b[H" + lines.map(line => `${line}\x1b[K`).join("\n") + "\x1b[J"
        );
    }

    return new Promise<void>(resolve => {
        const onKey = createKeyHandler(session, {
            quit,
            saveMembers,
            saveInterval,
            say: text => {
                message = text;
                draw();
            },
        });

        function onKeypress(_: string, key: Key | undefined) {
            onKey(key ?? {});
        }

        function restore() {
            stdout.write("\x1b[?25h\x1b[?1049l");
            if (stdin.isTTY) stdin.setRawMode(false);
        }

        function quit() {
            if (session.state.status === "running") session.togglePause();
            stdin.off("keypress", onKeypress);
            stdout.off("resize", draw);
            process.off("exit", restore);
            stdin.pause();
            restore();
            resolve();
        }

        // alternate screen, hidden cursor
        stdout.write("\x1b[?1049h\x1b[?25l");
        process.on("exit", restore);

        emitKeypressEvents(stdin);
        stdin.setRawMode(true);
        stdin.on("keypress", onKeypress);
        stdin.resume();
        stdout.on("resize", draw);

        draw();
    });
}
