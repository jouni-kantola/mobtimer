export function createTeam(members) {
    return members.map((name, index) => ({
        index,
        name,
        isHere: true,
        isActive: index === 0,
    }));
}

export function generateMemberMarkup(team) {
    return team
        .map(
            ({ name, index, isHere, isActive }) =>
                `<div class="grid user${
                    isActive ? " current" : ""
                }" data-index="${index}">
<input type="checkbox" role="switch" ${
                    isHere && "checked"
                } data-index="${index}" />
<input type="text" placeholder="Name" value="${name}" data-mob-user="${name}" />
</div>`
        )
        .join("");
}

export function whosNextAfter(recentActiveIndex, team) {
    const presentMembers = team.filter(m => m.isHere);
    if (presentMembers.length === 1) return presentMembers[0];

    for (let i = 1; i < team.length; i++) {
        const nextMemberIndex = getNextMemberIndex(
            recentActiveIndex,
            i,
            team.length
        );

        const upcomingMember = getMemberByIndex(nextMemberIndex, team);
        if (upcomingMember.isHere) return upcomingMember;
    }
}

function getMemberByIndex(index, team) {
    return team.find(m => m.index === index);
}

export function switchActiveMember(nextIndex, team) {
    for (const member of team) {
        member.isActive = member.index === nextIndex;
    }
}

export function getActiveMember(team) {
    return team.find(m => m.isActive);
}

export function getLast(team) {
    return team.filter(m => m.isHere).at(-1);
}

function getNextMemberIndex(recentActiveIndex, nextIndex, teamSize) {
    return (recentActiveIndex + nextIndex) % teamSize;
}
