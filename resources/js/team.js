export function createTeam(members) {
    return members.map((name, i) => ({
        index: i + 1,
        name,
        isHere: true,
        isActive: i === 0
    }));
}

export function generateMemberMarkup(team) {
    return team
        .map(
            ({ name, index, isHere, isActive }) =>
                `<div class="grid user${isActive ? " current" : ""}" data-index="${index}">
<input type="checkbox" role="switch" ${
                    isHere && "checked"
                } data-index="${index}" />
<input type="text" placeholder="Name" value="${name}" data-mob-user="${name}" />
</div>`
        )
        .join("");
}

export function whosNextAfter(recentActiveIndex, team) {
    for (let i = 1; i < team.length + 1; i++) {
        const nextMemberIndex = getNextMemberIndex(
            recentActiveIndex,
            i,
            team.length
        );

        if (team[nextMemberIndex - 1].isHere) {
            return nextMemberIndex;
        }
    }
}

function getNextMemberIndex(recentActiveIndex, nextIndex, teamSize) {
    return (recentActiveIndex + nextIndex) % (teamSize + 1) || 1;
}
