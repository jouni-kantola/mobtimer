import test from "ava";
import { defaultUsers } from "../resources/js/config.js";
import {
    createTeam,
    generateMemberMarkup,
    whosNextAfter,
    getLast,
} from "../resources/js/team.js";

test("map team to users", t => {
    const team = createTeam(defaultUsers);
    t.is(team[0].index, 0);
    t.is(team[0].name, "User 1");
    t.is(team.at(-1).index, 5);
    t.is(team.at(-1).name, "Break");
});

test("generate team members html", t => {
    const members = ["User 1", "User 2"];
    const expected = members
        .map(
            (m, i) =>
                `<div class="grid user${
                    i === 0 ? " current" : ""
                }" data-index="${i}">
<input type="checkbox" role="switch" checked data-index="${i}" />
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

    const after1 = whosNextAfter(0, team);
    const after2 = whosNextAfter(1, team);
    t.is(after1.index, 1);
    t.is(after1.name, "User 2");
    t.is(after2.index, 0);
    t.is(after2.name, "User 1");
});

test("skip member who's away", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[1].isHere = false;

    const after1 = whosNextAfter(0, team);
    t.is(after1.index, 2);

    team[1].isHere = true;
    team.at(-1).isHere = false;

    const after2 = whosNextAfter(1, team);
    t.is(after2.index, 0);
});

test("single user always next", t => {
    const members = ["User 1"];
    const team = createTeam(members);
    const after1 = whosNextAfter(0, team);
    t.is(after1.index, 0);
});

test("next member when alone is themselves", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[0].isHere = false;
    team[2].isHere = false;

    const after1 = whosNextAfter(1, team);
    t.is(after1.index, team[1].index);
});

test("last member is here", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[0].isHere = false;
    team[2].isHere = false;

    t.is(getLast(team).index, team[1].index);
});
