export type Member = {
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
    let next = presentMembers[0];

    if (presentMembers.length > 1) {
        for (let i = 1; i < team.length; i++) {
            const nextMemberIndex = getNextMemberIndex(
                recentActiveIndex,
                i,
                team.length
            );

            const upcomingMember = getMemberByIndex(nextMemberIndex, team);
            if (upcomingMember.isHere) {
                next = upcomingMember;
                break;
            }
        }
    }

    return next;
}

function getMemberByIndex(index: number, team: Array<Member>) {
    return team.filter(m => m.index === index)[0];
}

export function switchActiveMember(nextIndex: number, team: Array<Member>) {
    for (const member of team) {
        member.isActive = member.index === nextIndex;
    }
}

export function getActiveMember(team: Array<Member>) {
    return team.filter(m => m.isActive)[0];
}

export function getLast(team: Array<Member>) {
    return team.filter(m => m.isHere).slice(-1)[0];
}

export function addMember(name: string, team: Array<Member>) {
    team.push({
        index: team.length,
        name,
        isHere: true,
        isActive: false,
    });
}

export function shrinkTeam(team: Array<Member>) {
    team.pop();
}

function getNextMemberIndex(
    recentActiveIndex: number,
    nextIndex: number,
    teamSize: number
) {
    return (recentActiveIndex + nextIndex) % teamSize;
}
