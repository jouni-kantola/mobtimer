import test from "ava";
import { defaultUsers } from "../resources/js/config.js";
import { createTeam } from "../resources/js/team.js";

test("map team to users", t => {
    const team = createTeam(defaultUsers);
    t.is(team[0].index, 1);
    t.is(team[0].name, "User 1");
    t.is(team.at(-1).index, 6);
    t.is(team.at(-1).name, "Break");
});
