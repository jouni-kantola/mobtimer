export function createTeam(members) {
    return members.map((name, i) => ({
        index: i + 1,
        name,
    }));
}
