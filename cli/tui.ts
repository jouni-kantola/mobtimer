import { emitKeypressEvents } from "node:readline";
import {
    type Session,
    type SessionOptions,
    type SessionState,
    createSession,
} from "../lib/session.ts";
import { type StatusLabels } from "../lib/status.ts";
import { getActiveMember, whosNext } from "../lib/team.ts";
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
    "enter start/make selected driver · space start/pause · n next · ↑/↓ select · a away/back · r rename · 1-9 driver · b skip/toggle breaks · s shuffle · </> team size · +/- interval · q quit";

export function renderScreen(
    state: SessionState,
    labels: StatusLabels,
    {
        style = plain,
        message = "",
        selected,
    }: { style?: Style; message?: string; selected?: number } = {}
) {
    const status = state.onBreak ? "Break" : statusText[state.status];

    // a strong chevron for the driver, a light one for the selected member;
    // without colors bold and dim look the same, so the selected member
    // gets a thinner chevron
    const driverMark = style.bold("❯");
    const selectedMark = style === plain ? "›" : style.dim("❯");

    const members = state.team.map(member => {
        const number = member.index < 9 ? `${member.index + 1}` : " ";
        const line = `${number} ${member.name}`;
        const mark = member.isActive
            ? driverMark
            : member.index === selected
              ? selectedMark
              : " ";

        if (!member.isHere) return `${mark} ${style.dim(`${line} (away)`)}`;
        if (member.isActive) return `${mark} ${style.bold(line)}`;
        return `${mark} ${line}`;
    });

    return [
        "",
        `  ${style.inverse(` ${labels.timeLeft} `)}  ${style.bold(status)}${state.takeBreaks ? "" : style.dim("  (no breaks)")}`,
        "",
        `  Now: ${labels.now}`,
        `  Next: ${labels.next} (in ${labels.timeLeft})`,
        "",
        ...members.map(line => ` ${line}`),
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
    let renaming: { index: number; name: string } | undefined;
    // member picked with the arrow keys, undefined while following the driver
    let selected: number | undefined;

    const selectedIndex = () =>
        selected !== undefined && selected < session.state.team.length
            ? selected
            : getActiveMember(session.state.team).index;

    function select(change: number) {
        const size = session.state.team.length;
        selected = (selectedIndex() + change + size) % size;
    }

    function makeDriver(index: number) {
        // an away member is back when picked as driver
        if (session.state.team[index]?.isHere === false)
            session.setMemberHere(index, true);
        session.switchDriver(index);
        selected = undefined;
    }

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

    const onKey = (key: Key) => {
        if (key.ctrl && key.name === "c") return actions.quit();

        if (renaming) return editName(key, renaming);

        const memberNumber = /^[1-9]$/.test(key.sequence ?? "")
            ? Number(key.sequence) - 1
            : undefined;

        if (memberNumber !== undefined) {
            if (memberNumber < session.state.team.length)
                makeDriver(memberNumber);
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
            case "enter": {
                const index = selectedIndex();
                if (getActiveMember(session.state.team).index !== index)
                    makeDriver(index);
                else session.start();
                return actions.say("");
            }
            case "n":
                makeDriver(whosNext(session.state.team).index);
                return actions.say("");
            case "down":
                select(1);
                return actions.say("");
            case "up":
                select(-1);
                return actions.say("");
            case "b":
                if (session.state.onBreak) session.endBreak();
                else session.setTakeBreaks(!session.state.takeBreaks);
                return actions.say("");
            case "a": {
                // stay on the member so pressing a again brings them back
                const index = selectedIndex();
                session.setMemberHere(index, !session.state.team[index].isHere);
                selected = index;
                return actions.say("");
            }
            case "r": {
                const index = selectedIndex();
                renaming = { index, name: session.state.team[index].name };
                return sayRenaming(renaming);
            }
            case "s":
                selected = undefined;
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

    return Object.assign(onKey, {
        selected: () => selected,
    });
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
    let selected: () => number | undefined = () => undefined;

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
            selected: selected(),
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
        selected = onKey.selected;

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
