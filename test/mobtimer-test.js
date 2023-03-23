import test from "ava";
import { startTimer } from "../resources/js/clock.js";
import { defaultUsers } from "../resources/js/config.js";
import {
    createTeam,
    generateMemberMarkup,
    whosNextAfter,
} from "../resources/js/team.js";

test("map team to users", t => {
    const team = createTeam(defaultUsers);
    t.is(team[0].index, 1);
    t.is(team[0].name, "User 1");
    t.is(team.at(-1).index, 6);
    t.is(team.at(-1).name, "Break");
});

test("generate team members html", t => {
    const members = ["User 1", "User 2"];
    const expected = members
        .map(
            (m, i) =>
                `<div class="grid user${
                    i === 0 ? " current" : ""
                }" data-index="${i + 1}">
<input type="checkbox" role="switch" checked data-index="${i + 1}" />
<input type="text" placeholder="Name" value="${m}" data-mob-user="${m}" />
</div>`
        )
        .join("");

    const team = createTeam(members);
    const markup = generateMemberMarkup(team);

    t.is(markup, expected);
});

test("whos next when everyone here", t => {
    const members = ["User 1", "User 2"];
    const team = createTeam(members);

    const after1 = whosNextAfter(1, team);
    const after2 = whosNextAfter(2, team);
    t.is(after1.index, 2);
    t.is(after1.name, "User 2");
    t.is(after2.index, 1);
    t.is(after2.name, "User 1");
});

test("skip member who's away", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[1].isHere = false;

    const after1 = whosNextAfter(1, team);
    t.is(after1.index, 3);

    team[1].isHere = true;
    team.at(-1).isHere = false;

    const after2 = whosNextAfter(2, team);
    t.is(after2.index, 1);
});

test("single user always next", t => {
    const members = ["User 1"];
    const team = createTeam(members);
    const after1 = whosNextAfter(1, team);
    t.is(after1.index, 1);
});

test("next member when alone is themselves", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[0].isHere = false;
    team[2].isHere = false;

    const after1 = whosNextAfter(2, team);
    t.is(after1.index, team[1].index);
});

test("determine if running", t => {
    const seconds = 1;
    const timer = startTimer(seconds);
    t.true(timer.isRunning);
});

test("stopped when interval ends", async t => {
    const seconds = 1;
    const timer = startTimer(seconds);

    t.true(timer.isRunning);
    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });
    t.false(timer.isRunning);
});

test("callbacks every tick", async t => {
    const seconds = 3;
    let timesCalled = 0;

    await new Promise((resolve, _) => {
        startTimer(seconds, () => {
            timesCalled++;
            if (timesCalled === 2) {
                t.pass();
                resolve();
            }
        });
    });
});

test("notify when countdown done", async t => {
    await new Promise((resolve, _) => {
        startTimer(1, undefined, resolve); 
    });

    t.pass();
});

test("provide formatted time left", async t => {
    const seconds = 600;
    const timer = startTimer(seconds);

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    t.is("09:59", timer.timeLeft);
});

test("can change timer", async t => {
    const timer = startTimer(600);
    timer.change(300);
    t.is("05:00", timer.timeLeft);
    timer.change(1);
    t.is("00:01", timer.timeLeft);
});
