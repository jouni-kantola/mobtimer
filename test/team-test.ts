import { assert, test } from "vitest";
import { defaultMembers } from "../resources/scripts/config";
import {
    createTeam,
    whosNext,
    whosNextAfter,
    getLast,
    adjustTeamSize,
    shuffleTeam,
} from "../resources/scripts/team";

test("map names to team", () => {
    const team = createTeam(defaultMembers);

    assert.isTrue(team.every(member => member.isHere));
    assert.lengthOf(
        team.filter(member => member.isActive),
        1
    );

    const activeMember = team[0];
    assert.strictEqual(activeMember.isActive, true);
    assert.strictEqual(activeMember.index, 0);
    assert.strictEqual(activeMember.name, "Member 1");

    assert.strictEqual(team.at(-1)!.index, 5);
    assert.strictEqual(team.at(-1)!.name, "Member 6");

    const ids = team.map(member => member.id);
    const uniqueIds = [...new Set(ids)];
    assert.lengthOf(uniqueIds, ids.length);
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

test("increase team size", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);

    adjustTeamSize(team, 5);

    assert.strictEqual(team.at(-1)!.name, "Member 5");
    assert.strictEqual(team.at(-1)!.index, 4);
    assert.strictEqual(team.at(-1)!.isHere, true);
    assert.strictEqual(team.at(-1)!.isActive, false);
    assert.ok(team.at(-1)!.id);
});

test("decrease team size", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);

    adjustTeamSize(team, 1);

    assert.strictEqual(team.length, 1);
    assert.strictEqual(team.at(-1)!.name, "Member 1");
    assert.strictEqual(team.at(-1)!.index, 0);
});

test("shrink team", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);

    adjustTeamSize(team, 2);

    assert.strictEqual(team.length, 2);
    assert.strictEqual(team.at(-1)!.name, "Member 2");
    assert.strictEqual(team.at(-1)!.index, 1);
});

test("prevent shrinking team to zero", () => {
    const members = ["Member 1"];
    const team = createTeam(members);

    adjustTeamSize(team, 0);

    assert.strictEqual(team.length, 1);
    assert.strictEqual(team.at(-1)!.name, "Member 1");
    assert.strictEqual(team.at(-1)!.index, 0);
});

test("only shrink by removing inactive members", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);

    team[0].isActive = false;
    team[1].isActive = true;

    adjustTeamSize(team, 1);

    assert.strictEqual(team.length, 1);
    assert.strictEqual(team.at(-1)!.name, "Member 2");
    assert.strictEqual(team.at(-1)!.index, 0);
});

test("shuffle team with status kept intact", () => {
    const members = ["Member 1", "Member 2", "Member 3"];
    const team = createTeam(members);
    team[0].isActive = false;
    team[1].isHere = false;
    team[2].isActive = true;

    shuffleTeam(team);

    assert.strictEqual(team.length, 3);
    assert.notDeepEqual(
        members,
        team.map(m => m.name)
    );
    assert.strictEqual(team[0].index, 0);
    assert.strictEqual(team[1].index, 1);
    assert.strictEqual(team[2].index, 2);

    const member1 = team.find(m => m.name === "Member 1")!;
    assert.isFalse(member1.isActive);
    assert.isTrue(member1.isHere);

    const member2 = team.find(m => m.name === "Member 2")!;
    assert.isFalse(member2.isHere);
    assert.isFalse(member2.isActive);

    const member3 = team.find(m => m.name === "Member 3")!;
    assert.isTrue(member3.isActive);
    assert.isTrue(member3.isHere);
});

test("shuffle team of one stays same", () => {
    const members = ["Member 1"];
    const team = createTeam(members);

    shuffleTeam(team);

    assert.deepEqual(
        members,
        team.map(m => m.name)
    );
    assert.strictEqual(team[0].index, 0);
});

test("whos next", () => {
    const members = ["Member 1", "Member 3"];
    const team = createTeam(members);
    team[0].isActive = false;
    team[1].isActive = true;

    const next = whosNext(team);

    assert.strictEqual(next.index, 0);
    assert.strictEqual(next.name, "Member 1");
});
