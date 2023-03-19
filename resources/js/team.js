export function createTeam(members) {
    return members.map((name, i) => ({
        index: i + 1,
        name,
        isHere: true,
    }));
}

export function generateMemberMarkup(team) {
    return team
        .map(
            ({ name, index, isHere }) =>
                `<div class="grid user" data-index="${index}">
<input type="checkbox" role="switch" ${isHere && "checked"} data-index="${index}" />
<input type="text" placeholder="Name" value="${name}" data-mob-user="${name}" />
</div>`
        )
        .join("");
}

export function getNextMemberIndex(recentActiveIndex, nextIndex, teamSize) {
    return (recentActiveIndex + nextIndex) % (teamSize + 1) || 1;
}