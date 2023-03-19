import test from "ava";
import { defaultUsers } from "../resources/js/config.js";
import { createTeam, generateMemberMarkup, getNextMemberIndex } from "../resources/js/team.js";

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
                `<div class="grid user" data-index="${i + 1}">
<input type="checkbox" role="switch" checked data-index="${i + 1}" />
<input type="text" placeholder="Name" value="${m}" data-mob-user="${m}" />
</div>`
        )
        .join("");

    const team = createTeam(members);
    const markup = generateMemberMarkup(team);

    t.is(markup, expected);
});

test("get next team member's index", t => {
    t.is(getNextMemberIndex(1, 1, 1), 1);
    t.is(getNextMemberIndex(1, 1, 3), 2);
    t.is(getNextMemberIndex(1, 2, 3), 3);
    t.is(getNextMemberIndex(1, 3, 3), 1);
    t.is(getNextMemberIndex(1, 4, 3), 1);
});
