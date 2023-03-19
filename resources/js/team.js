export function createTeam(members) {
    return members.map((name, i) => ({
        index: i + 1,
        name,
    }));
}

export function generateMemberMarkup(team) {
    return team
        .map(
            ({ name, index }) =>
                `<div class="grid user" data-index="${index}">
<input type="checkbox" role="switch" checked />
<input type="text" placeholder="Name" value="${name}" data-mob-user="${name}" />
</div>`
        )
        .join("");
}
