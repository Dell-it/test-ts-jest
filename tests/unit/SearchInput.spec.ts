import { shallowMount, mount } from "@vue/test-utils";
import SearchInput from "@/components/SearchInput/index.vue";

describe("Монтирование и проброс данных", () => {
  const wrapper = shallowMount(SearchInput);
  const input = wrapper.find(".searchInput__input");

  it("Монтирование инпута", () => {
    expect(input.classes().includes("searchInput__input")).toBe(true);
  });

  it("Передача данных в компонент", async () => {
    const value = "testValue1";

    await wrapper.setProps({ value });

    expect((input.element as HTMLInputElement).value).toBe(value);
  });

  it("Emit данных из компонента", async () => {
    const value = "testValue2";
    await input.setValue(value);

    expect(wrapper.emitted("input")?.[0]).toEqual([value]);
  });
});

describe("Получение данных с API", () => {
  const wrapper = shallowMount(SearchInput);
  const input = wrapper.find(".searchInput__input");
  const mockName = "Leanne Graham";
  const mockPhotoUrl = "https://via.placeholder.com/150/92c952";

  it("Наличие пользователя и фото", (done) => {
    input.setValue(mockName);

    setTimeout(() => {
      expect(
        wrapper.vm.$data?.users[0]?.name === mockName &&
          wrapper.vm.$data.users[0].photo.thumbnailUrl === mockPhotoUrl
      ).toBe(true);
      done();
    }, 400 /* await debounce */);
  });

  it("Монтирование разметки списка", (done) => {
    input.element.focus();

    wrapper.vm.$nextTick(() => {
      expect(wrapper.get(".searchInput__list"));
      done();
    });
  });

  it("Соответствие снепшоту", (done) => {
    input.setValue(mockName);
    input.element.focus();

    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.$el).toMatchSnapshot();
      done();
    });
  });
});
