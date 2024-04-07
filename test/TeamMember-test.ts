import { assert, test } from "vitest";
import { mount } from "@vue/test-utils";
import TeamMember from "../resources/scripts/components/TeamMember.vue";

test("here status can be toggled", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 0,
            name: "Team Member",
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");

    await isHereToggle.trigger("click");

    assert.equal((isHereToggle.element as HTMLInputElement).checked, false);
});

test("cannot toggle last member as away", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 0,
            name: "Team Member",
            onlyOneActiveMember: true,
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");

    await isHereToggle.trigger("click");

    assert.equal((isHereToggle.element as HTMLInputElement).checked, true);
});

test("toggling member to active isn't affected by number of members", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 0,
            name: "Team Member",
            onlyOneActiveMember: true,
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");
    (isHereToggle.element as HTMLInputElement).checked = false;

    await isHereToggle.trigger("click");

    assert.equal((isHereToggle.element as HTMLInputElement).checked, true);
});

test("notify when member status toggled", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 999,
            name: "Team Member",
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");

    await isHereToggle.trigger("change");

    assert.deepEqual(wrapper.emitted().notifyMemberStatus[0], [999, true]);
});

test("announce when selecting driver", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 999,
            name: "Team Member",
        },
    });

    const nameInput = wrapper.find("input[type='text']");
    await nameInput.trigger("dblclick");

    assert.deepEqual(wrapper.emitted().switchDriver[0], [999]);
});

test("driver cannot be a member who's away", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 999,
            name: "Team Member",
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");
    await isHereToggle.trigger("click");
    await isHereToggle.trigger("change");

    const nameInput = wrapper.find("input[type='text']");
    await nameInput.trigger("dblclick");

    assert.notProperty(wrapper.emitted(), "switchDriver");
});

test("notify when member name changed", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 999,
            name: "Team Member",
        },
    });

    const nameInput = wrapper.find("input[type='text']");
    await nameInput.setValue("New Name");

    assert.deepEqual(wrapper.emitted().updateMemberName[0], [999, "New Name"]);
});

test("highlight active member", () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 999,
            name: "Team Member",
            isActive: true,
        },
    });

    assert.isTrue(wrapper.find(".current").exists());
});

test("no tooltip when away", async () => {
    const wrapper = mount(TeamMember, {
        props: {
            index: 999,
            name: "Team Member",
            isActive: true,
            tooltip: "Is here",
        },
    });

    assert.isTrue(wrapper.find(".tooltip").exists());

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");
    await isHereToggle.trigger("click");
    await isHereToggle.trigger("change");

    assert.isFalse(wrapper.find(".tooltip").exists());
});
