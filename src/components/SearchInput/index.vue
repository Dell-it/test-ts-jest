<template>
  <div class="searchInput" @focusout="focusout">
    <label class="searchInput__label">
      <svg-icon class="searchInput__icon" name="search" />

      <input
        type="text"
        class="searchInput__input"
        placeholder="Search"
        :value="value"
        @input="input($event.target.value)"
        @focus="isFocus = true"
        @keydown.up.prevent="keyArrow($event.code)"
        @keydown.down.prevent="keyArrow($event.code)"
        @keyup.enter.prevent="keyEnter"
      />
    </label>

    <ul
      class="searchInput__list"
      v-if="isFocus && (users.length || isLoading)"
      ref="list"
    >
      <li v-if="isLoading" class="searchInput__loading">
        <div class="searchInput__loadingIcon"></div>
      </li>

      <template v-else v-for="(user, index) in users">
        <li
          :ref="highlightId === user.id ? `highlightItem` : null"
          class="searchInput__listItem"
          :class="{
            'searchInput__listItem--highlight': highlightId === user.id,
          }"
          :key="user.id"
          @click="selectItem(user)"
          @mousemove="hoverItem(user.id)"
          :tabindex="index"
        >
          <img
            v-if="(user.photo || {}).thumbnailUrl"
            :src="user.photo.thumbnailUrl"
            alt=""
            class="searchInput__listItemPhoto"
          />

          <div class="searchInput__listItemContent">
            <div class="searchInput__listItemName" v-if="user.name">
              {{ user.name }}
            </div>
            <div class="searchInput__listItemUsername" v-if="user.username">
              @{{ user.username }}
            </div>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import { Photo, User } from "@/types/user";
import { debounce } from "vue-debounce";
import SvgIcon from "@/components/SvgIcon.vue";

type VmData = {
  users: Array<User>;
  isLoading: boolean;
  isFocus: boolean;
  highlightId: number;
};

type TVoid = (fn: () => void) => void;

const dFn: TVoid = debounce((f) => f(), 400);

const buildQueryPhotos = (users: Array<User>): string => {
  return "?id=" + users.map((user) => user.id).join("&id=");
};

export default Vue.extend({
  name: "SearchInput",

  components: { SvgIcon },

  props: {
    value: {
      type: String,
      default: "",
    },
  },

  data(): VmData {
    return {
      users: [],
      isLoading: false,
      isFocus: false,
      highlightId: -1,
    };
  },

  methods: {
    resetHighlight() {
      this.highlightId = -1;
    },

    /* Выбор конкретного пользователя */
    selectItem(user: User) {
      this.isFocus = false;
      this.$emit("input", user.name);
      this.findUser(user.name);
    },

    /* Изменение данных в input */
    input(e: string) {
      this.isFocus = true;

      this.$emit("input", e);

      dFn(() => {
        this.isLoading = true;
        this.findUser(e);
      });
    },

    /* Запрос и маппинг пользователей, фотографий */
    async findUser(e: string) {
      const lowerInputText = e?.toLowerCase();

      const users: Array<User> = await axios
        .get("https://jsonplaceholder.typicode.com/users")
        .then((res) => {
          return res?.data?.filter(
            (user: User) =>
              user.name?.toLowerCase().includes(lowerInputText) ||
              user.username?.toLowerCase().includes(lowerInputText)
          );
        })
        .catch((err) => console.error(err));

      if (users.length) {
        const photos: Array<Photo> = await axios
          .get(
            "https://jsonplaceholder.typicode.com/photos" +
              buildQueryPhotos(users)
          )
          .then((res) => res.data)
          .catch((err) => console.error(err));

        this.users = users.map((user: User) => {
          const photo = photos?.find((photo) => photo.id === user.id);
          return { ...user, photo, highlight: false };
        });
      }

      this.resetHighlight();
      this.isLoading = false;
    },

    /* Обработчик выбора listItem'a с клавиатуры */
    async keyArrow(keyCode: string) {
      const highlightIndex = this.users.findIndex(
        (user) => user.id === this.highlightId
      );

      if (this.highlightId !== -1) {
        if (keyCode === "ArrowUp" && highlightIndex > 0) {
          this.highlightId = this.users[highlightIndex - 1].id;
        }

        if (keyCode === "ArrowDown" && highlightIndex < this.users.length - 1) {
          this.highlightId = this.users[highlightIndex + 1].id;
        }
      } else {
        this.highlightId = this.users[0]?.id;
      }

      /* Ждём обновления DOM */
      await this.$nextTick();

      /* Скролл к подсвеченым элементам */
      const item = (this.$refs.highlightItem as Array<HTMLElement>)?.[0];
      const list = this.$refs.list as HTMLElement;

      if (item && list) {
        const itemOffsetLower = item.offsetTop + item.offsetHeight;
        const lowerScroll = list.scrollTop + list.clientHeight;

        if (list.scrollTop > item.offsetTop || itemOffsetLower > lowerScroll) {
          if (keyCode === "ArrowUp") {
            list.scrollTop = item.offsetTop;
          }

          if (keyCode === "ArrowDown") {
            list.scrollTop =
              item.offsetTop - list.clientHeight + item.offsetHeight;
          }
        }
      }
    },

    /* Обработчик клавиши Enter */
    keyEnter() {
      const user: User | undefined = this.users.find(
        (user) => user.id === this.highlightId
      );

      if (user) {
        this.selectItem(user);
      }
    },

    /* Обработчик наведения курсора на listItem */
    hoverItem(id: number) {
      this.highlightId = id;
    },

    /* Обработка смены фокуса */
    focusout(e: FocusEvent) {
      if (!this.$el.contains(e.relatedTarget as Node)) {
        this.isFocus = false;
      }
    },
  },
});
</script>

<style lang="scss">
.searchInput {
  position: relative;

  display: inline-block;

  &__label {
  }

  &__icon {
    position: absolute;
    left: 19px;
    top: 19px;

    width: 17px;
    height: 17px;

    pointer-events: none;
  }

  &__loading {
    border-radius: 50%;
    overflow: hidden;
  }

  &__loadingIcon {
    position: relative;

    width: 72px;
    height: 72px;
    margin: 30px auto;

    background: linear-gradient(#ff6647, #d6008f);
    border-radius: 50%;

    animation: rotate infinite 0.6s linear;

    &:before {
      content: "";

      position: absolute;
      left: 3px;
      top: 3px;
      right: 3px;
      bottom: 3px;
      z-index: 1;

      border-radius: 50%;
      background: #ffffff;
    }

    &:after {
      content: "";

      position: absolute;
      left: 50%;
      bottom: -20px;

      width: 40px;
      height: 40px;

      background: #ffffff;
      border-radius: 50%;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }
  }

  &__input {
    width: 100%;
    min-width: 340px;
    min-height: 56px;
    padding: 12px 20px 12px 56px;

    background: #f9f9f9;
    border: none;
    border-bottom: 1px solid #000000;
    border-radius: 6px 6px 0 0;
    outline: none;
  }

  &__list {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;

    padding: 0;
    margin: 0;
    max-height: 200px;

    background: #ffffff;
    border-radius: 0 0 6px 6px;
    list-style: none;
    overflow: auto;
  }

  &__listItem {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 8px 16px;

    cursor: pointer;
    outline: none;

    &--highlight {
      background: #f6f6f6;
    }
  }

  &__listItemPhoto {
    width: 40px;
    height: 40px;
    margin-right: 8px;

    border: 1px solid #e5e5e6;
    border-radius: 50%;
  }

  &__listItemContent {
    align-self: center;
    text-align: left;
  }

  &__listItemName {
    margin-bottom: 4px;

    color: #000000;
    font-size: 14px;
  }

  &__listItemUsername {
    color: #98999a;
    font-size: 12px;
  }
}
</style>
