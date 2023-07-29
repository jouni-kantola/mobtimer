import { assert, test } from "vitest";
import { mount } from "@vue/test-utils";
import Member from "../resources/js/components/Member.vue";

test("here status can be toggled", async () => {
    const wrapper = mount(Member, {
        props: {
            index: 0,
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");

    await isHereToggle.trigger("click");

    assert.equal((isHereToggle.element as HTMLInputElement).checked, false);
});

test("cannot toggle last member as away", async () => {
    const wrapper = mount(Member, {
        props: {
            index: 0,
            isLastHere: true,
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");

    await isHereToggle.trigger("click");

    assert.equal((isHereToggle.element as HTMLInputElement).checked, true);
});

test("notify when member status toggled", async () => {
    const wrapper = mount(Member, {
        props: {
            index: 999,
        },
    });

    const isHereToggle = wrapper.find("input[type='checkbox']:checked");

    await isHereToggle.trigger("change");

    assert.deepEqual(wrapper.emitted().notifyMemberStatus[0], [999, true]);
});
