import { assert, test } from "vitest";
import { defaultUsers } from "../resources/js/config.js";
import {
    createTeam,
    whosNextAfter,
    getLast,
} from "../resources/js/team.js";

test("map team to users", t => {
    const team = createTeam(defaultUsers);
    assert.strictEqual(team[0].index, 0);
    assert.strictEqual(team[0].name, "User 1");
    assert.strictEqual(team.at(-1).index, 5);
    assert.strictEqual(team.at(-1).name, "User 6");
});

test("whos next when everyone here", t => {
    const members = ["User 1", "User 2"];
    const team = createTeam(members);

    const after1 = whosNextAfter(0, team);
    const after2 = whosNextAfter(1, team);
    assert.strictEqual(after1.index, 1);
    assert.strictEqual(after1.name, "User 2");
    assert.strictEqual(after2.index, 0);
    assert.strictEqual(after2.name, "User 1");
});

test("skip member who's away", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[1].isHere = false;

    const after1 = whosNextAfter(0, team);
    assert.strictEqual(after1.index, 2);

    team[1].isHere = true;
    team.at(-1).isHere = false;

    const after2 = whosNextAfter(1, team);
    assert.strictEqual(after2.index, 0);
});

test("single user always next", t => {
    const members = ["User 1"];
    const team = createTeam(members);
    const after1 = whosNextAfter(0, team);
    assert.strictEqual(after1.index, 0);
});

test("next member when alone is themselves", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[0].isHere = false;
    team[2].isHere = false;

    const after1 = whosNextAfter(1, team);
    assert.strictEqual(after1.index, team[1].index);
});

test("last member is here", t => {
    const members = ["User 1", "User 2", "User 3"];
    const team = createTeam(members);
    team[0].isHere = false;
    team[2].isHere = false;

    assert.strictEqual(getLast(team).index, team[1].index);
});
