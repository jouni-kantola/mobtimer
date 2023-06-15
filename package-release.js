import AdmZip from "adm-zip";
import rcedit from "rcedit";
import cpy from "cpy";

const neuZip = new AdmZip("dist/mobtimer-release.zip");
neuZip.extractAllTo("dist/release", true);

await rcedit("dist/release/mobtimer-win_x64.exe", {
    icon: "resources/icons/appIcon.ico",
});

await cpy("lib/*", "dist/release");

const releaseZip = new AdmZip();
releaseZip.addLocalFolder("dist/release");
releaseZip.writeZip("dist/mobtimer-release.zip");
