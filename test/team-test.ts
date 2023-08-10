import { assert, test } from "vitest";
import { defaultMembers } from "../resources/scripts/config";
import { createTeam, whosNextAfter, getLast } from "../resources/scripts/team";

test("map names to team", () => {
    const team = createTeam(defaultMembers);
    assert.strictEqual(team[0].index, 0);
    assert.strictEqual(team[0].name, "Member 1");
    assert.strictEqual(team.at(-1)!.index, 5);
    assert.strictEqual(team.at(-1)!.name, "Member 6");
});

test("whos next when everyone here", () => {
    const members = ["Member 1", "Member 2"];
    const team = createTeam(members);

    const after1 = whosNextAfter(0, team);
    const after2 = whosNextAfter(1, team);
    assert.strictEqual(after1.index, 1);
    assert.strictEqual(after1.name, "Member 2");
    assert.strictEqual(after2.index, 0);
    assert.strictEqual(after2.name, "Member 1");
});

test("skip member who's away", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);
    team[1].isHere = false;

    const after1 = whosNextAfter(0, team);
    assert.strictEqual(after1.index, 2);

    team[1].isHere = true;
    team.at(-1)!.isHere = false;

    const after2 = whosNextAfter(1, team);
    assert.strictEqual(after2.index, 0);
});

test("single member always next", () => {
    const members = ["Member 1"];
    const team = createTeam(members);
    const after1 = whosNextAfter(0, team);
    assert.strictEqual(after1.index, 0);
});

test("next member when alone is themselves", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);
    team[0].isHere = false;
    team[2].isHere = false;

    const after1 = whosNextAfter(1, team);
    assert.strictEqual(after1.index, team[1].index);
});

test("last member is here", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);
    team[0].isHere = false;
    team[2].isHere = false;

    assert.strictEqual(getLast(team).index, team[1].index);
});
