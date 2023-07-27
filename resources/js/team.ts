type Member = {
    index: number;
    name: string;
    isHere: boolean;
    isActive: boolean;
};

export function createTeam(members: Array<string>): Array<Member> {
    return members.map((name, index) => ({
        index,
        name,
        isHere: true,
        isActive: index === 0,
    }));
}

export function whosNextAfter(recentActiveIndex: number, team: Array<Member>) {
    const presentMembers = team.filter(m => m.isHere);
    if (presentMembers.length === 1) return presentMembers[0];

    for (let i = 1; i < team.length; i++) {
        const nextMemberIndex = getNextMemberIndex(
            recentActiveIndex,
            i,
            team.length
        );

        const upcomingMember = getMemberByIndex(nextMemberIndex, team);
        if (upcomingMember?.isHere) return upcomingMember;
    }
}

function getMemberByIndex(index: number, team: Array<Member>) {
    return team.find(m => m.index === index);
}

export function switchActiveMember(nextIndex: number, team: Array<Member>) {
    for (const member of team) {
        member.isActive = member.index === nextIndex;
    }
}

export function getActiveMember(team: Array<Member>) {
    return team.find(m => m.isActive);
}

export function getLast(team: Array<Member>) {
    return team.filter(m => m.isHere).slice(-1)[0];
}

function getNextMemberIndex(
    recentActiveIndex: number,
    nextIndex: number,
    teamSize: number
) {
    return (recentActiveIndex + nextIndex) % teamSize;
}
