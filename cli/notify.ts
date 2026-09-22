import { execFile } from "node:child_process";

export type Notifier = (title: string, message: string) => void;

// bell plus a desktop notification where available; failures are ignored
export function createNotifier(
    write: (text: string) => void,
    platform = process.platform
): Notifier {
    return (title, message) => {
        write("\x07");

        const command = notificationCommand(title, message, platform);
        if (command) execFile(command[0], command.slice(1), () => {});
    };
}

export function notificationCommand(
    title: string,
    message: string,
    platform: string
): string[] | undefined {
    switch (platform) {
        case "darwin":
            return [
                "osascript",
                "-e",
                `display notification ${appleScriptString(message)} with title ${appleScriptString(title)}`,
            ];
        case "linux":
            return ["notify-send", title, message];
        default:
            return undefined;
    }
}

function appleScriptString(value: string) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
