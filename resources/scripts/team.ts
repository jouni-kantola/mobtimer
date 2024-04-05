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

export function whosNext(team: Array<Member>) {
    const activeMember = getActiveMember(team);
    return whosNextAfter(activeMember.index, team);
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

function addMember(name: string, team: Array<Member>) {
    team.push({
        index: team.length,
        name,
        isHere: true,
        isActive: false,
    });
}

export function adjustTeamSize(team: Array<Member>, newSize: number) {
    if (newSize < 1) return;

    if (newSize < team.length) {
        let i = team.length - 1;

        while (team.length > newSize) {
            if (!team[i].isActive) {
                team.splice(i, 1);
            }

            i--;
        }

        for (let i = 0; i < team.length; i++) {
            team[i].index = i;
        }
    } else {
        for (let i = team.length; i < newSize; i++) {
            addMember(`Member ${i + 1}`, team);
        }
    }
}

export function shuffleTeam(team: Array<Member>) {
    if (team.length <= 1) return;

    const originalTeamOrder = team.slice();

    for (let i = team.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [team[i], team[randomIndex]] = [team[randomIndex], team[i]];
    }
    team.forEach((m, i) => {
        m.index = i;
    });

    if (JSON.stringify(team) === JSON.stringify(originalTeamOrder))
        shuffleTeam(team);
}

function getNextMemberIndex(
    recentActiveIndex: number,
    nextIndex: number,
    teamSize: number
) {
    return (recentActiveIndex + nextIndex) % teamSize;
}
