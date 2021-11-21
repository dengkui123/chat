<template>
  <div class="user-list">
    <nav-bar class="nav-bar">
      <template v-slot:left>
        <div class="gray avatar" :class="{ online: isLogin }">
          <img v-if="userInfo" :src="userInfo.avatar" alt="" />
        </div>
      </template>
      <template v-slot:title>
        <div class="title">{{ '好友列表' }}</div>
      </template>
    </nav-bar>
    <div class="users">
      <div
        class="user-item"
        v-for="item in friends"
        :key="item.id"
        @click="chatWith(item)"
        :class="{
          unread:
            unReadList.includes(item.username) ||
            onlineUnread.includes(item.username),
        }"
      >
        <div
          class="left gray"
          :class="{
            online: item.isonline === 'true',
          }"
        >
          <img :src="item.avatar" alt="头像" />
        </div>
        <div class="right">
          <span class="username">{{ item.username }}</span>
          <span class="msg"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/navbar/NavBar.vue';

export default {
  name: 'UserList',
  components: {
    NavBar,
  },
  props: {
    userInfo: {
      type: Object,
      default: () => {},
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    users: {
      type: Array,
      default: () => [],
    },
    unReadList: {
      type: Array,
      default: () => [],
    },
    onlineUnread: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {};
  },
  computed: {
    friends() {
      return this.users.filter((item) => item.id !== this.userInfo.id);
    },
  },
  methods: {
    chatWith(item) {
      this.$emit('choose-user', item);
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.user-list {
  width: 100%;
  box-sizing: border-box;
  .avatar img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }
  // 黑白头像
  .gray {
    filter: grayscale(1);
  }
  .online {
    filter: grayscale(0);
  }
  .title {
    height: 60px;
    line-height: 60px;
  }
  .users {
    overflow-y: auto;
    .user-item {
      height: 60px;
      line-height: 60px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      border-radius: 10px;
      margin-bottom: 10px;
      box-shadow: 0 0 2px 0px rgba($color: #ccc, $alpha: 1);
      transition: 0.2s all;
      &:active {
        box-shadow: 0 0 3px 1px rgba($color: skyblue, $alpha: 1);
      }
    }
    .left img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      padding: 10px;
    }
    .unread {
      position: relative;

      &::after {
        display: block;
        content: '';
        position: absolute;
        top: 40px;
        left: 40px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: red;
      }
    }
  }
}
</style>
