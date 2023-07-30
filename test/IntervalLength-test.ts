import { assert, test } from "vitest";
import { mount } from "@vue/test-utils";
import IntervalLength from "../resources/scripts/components/IntervalLength.vue";

test("min value is automatically padded", () => {
    const wrapper = mount(IntervalLength, {
        props: {
            value: 0,
            min: 1,
        },
    });

    const el = wrapper.find("input").element as HTMLInputElement;

    assert.equal(el.value, "01");
});

test("value less than 10 is automatically padded", () => {
    const wrapper = mount(IntervalLength, {
        props: {
            value: 9,
            min: 1,
        },
    });

    const el = wrapper.find("input").element as HTMLInputElement;

    assert.equal(el.value, "09");
});

test("value more than 10 is left as is", () => {
    const wrapper = mount(IntervalLength, {
        props: {
            value: 10,
            min: 1,
        },
    });

    const el = wrapper.find("input").element as HTMLInputElement;

    assert.equal(el.value, "10");
});

test("interval length is based on min value", async () => {
    const wrapper = mount(IntervalLength, {
        props: {
            value: 0,
            min: 5,
        },
    });

    await wrapper.find("input").setValue("2");

    assert.deepEqual(wrapper.emitted().intervalUpdated[0], [5]);
});

test("when value larger than min its used as interval length", async () => {
    const wrapper = mount(IntervalLength, {
        props: {
            value: 0,
            min: 5,
        },
    });

    await wrapper.find("input").setValue("6");

    assert.deepEqual(wrapper.emitted().intervalUpdated[0], [6]);
});

test("max caps value", async () => {
    const wrapper = mount(IntervalLength, {
        props: {
            value: 0,
            max: 59,
        },
    });

    const input = wrapper.find("input");
    await input.setValue("999");
    const el = input.element as HTMLInputElement;

    assert.deepEqual(wrapper.emitted().intervalUpdated[0], [59]);
    // TODO: Ensure value is capped
    // assert.equal(el.value, "59");
});

test("value cant be blank", () => {
    const wrapper = mount(IntervalLength, {
        props: {
            value: NaN,
        },
    });

    const el = wrapper.find("input").element as HTMLInputElement;

    assert.equal(el.value, "00");
});
