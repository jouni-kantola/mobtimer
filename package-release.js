import AdmZip from "adm-zip";
import * as rcedit from "rcedit";

const neuZip = new AdmZip("dist/mobtimer-release.zip");
neuZip.extractAllTo("dist/release", true);

await rcedit("dist/release/mobtimer-win_x64.exe", {
    icon: "resources/icons/appIcon.ico",
});

const releaseZip = new AdmZip();
releaseZip.addLocalFolder("dist/release");
releaseZip.writeZip("dist/mobtimer-release.zip");
