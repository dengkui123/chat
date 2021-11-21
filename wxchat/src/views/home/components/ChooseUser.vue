<template>
  <div class="choose-user">
    <h1 class="title">请选择你聊天的角色</h1>
    <ul class="avatar-list">
      <li
        class="item"
        v-for="item in userList"
        :key="item.id"
        @click="chooseEvent(item)"
        v-show="!item.socketid"
      >
        <img class="img" :src="item.avatar" alt="" />
        <p class="name">{{ item.username }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ChooseUser',
  conponents: {},
  props: {
    userList: {
      type: Array,
      default: () => {},
    },
    socket: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
  },
  methods: {
    chooseEvent(item) {
      this.$emit('myUserInfo', item);
      this.socket.emit('login', item);
    },
  },
};
</script>

<style lang="scss" scoped>
.choose-user {
  background-color: #eee;
  height: 100vh;
  .title {
    height: 50px;
    font-size: 20px;
    line-height: 50px;
    text-align: center;
    padding: 10px;
  }
  .avatar-list {
    padding: 10px;
    height: 100px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .item {
      width: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      .img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }
      .name {
        // text-align: center;
        height: 20px;
      }
    }
  }
}
</style>
