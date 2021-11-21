<template>
  <div v-if="toUser" class="chat-container">
    <!-- 聊天顶部栏 -->
    <nav-bar class="nav-bar" :userInfo="userInfo" :isLogin="isLogin">
      <template v-slot:left>
        <div class="back" @click="$emit('closeChat')">
          <img src="~@/assets/img/left.png" alt="" />
        </div>
      </template>
      <template v-slot:title>
        <div>{{ toUser.username }}</div>
      </template>
    </nav-bar>
    <!-- 消息列表 -->
    <div class="chat-list" ref="chat">
      <div
        v-for="(item, index) in chatList"
        :key="index"
        class="chat-item"
        :class="{ self: userInfo.username === item.from.username }"
      >
        <div class="avatar" v-if="toUser.username === item.from.username">
          <img :src="item.from.avatar" alt="" />
        </div>
        <div
          class="content"
          :class="userInfo.username === item.from.username ? 'right' : 'left'"
        >
          {{ item.content }}
        </div>
        <div class="avatar" v-if="userInfo.username === item.from.username">
          <img :src="item.from.avatar" alt="" />
        </div>
      </div>
    </div>
    <!-- 聊天输入框 -->
    <div class="chat-input">
      <form class="form" onsubmit="return false;">
        <input
          class="input"
          type="text"
          v-model="message"
          autocomplete="off"
          ref="inputdata"
        />
        <button class="button" @click="send">发送</button>
      </form>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/navbar/NavBar.vue';
export default {
  name: 'Chat',
  components: {
    NavBar,
  },
  props: {
    toUser: {
      type: Object,
      default: () => {},
    },
    userInfo: {
      type: Object,
      default: () => {},
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    socket: {
      type: Object,
      default: () => {},
    },
    newMsgObj: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      message: '',
      chatList: [],
      isKeyUp: false,
    };
  },
  watch: {
    newMsgObj(val) {
      this.chatList.push(val);
      this.goBottom();
    },
  },
  computed: {},
  methods: {
    send() {
      const msg = {
        from: this.userInfo,
        to: this.toUser,
        content: this.message,
        time: new Date().getTime(),
      };
      console.log(msg);
      // 发送到服务端
      this.socket.emit('sendMsg', msg);

      this.chatList.push(msg);
      this.message = '';
      // 把聊天内容存储到本地
      this.saveChatHistory();
      // 滑动到最底部
      this.goBottom();
    },
    saveChatHistory() {
      const chatKey = `${this.userInfo.id}-chat_with-${this.toUser.id}`;
      localStorage[chatKey] = JSON.stringify(this.chatList);
      this.getChatHistory();
    },
    getChatHistory() {
      const chatKey = `${this.userInfo.id}-chat_with-${this.toUser.id}`;
      if (localStorage[chatKey]) {
        this.chatList = JSON.parse(localStorage[chatKey]);
      }
    },
    goBottom() {
      setTimeout(() => {
        this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
      }, 5);
    },
  },
  created() {
    this.$nextTick(() => {
      this.$refs.inputdata.focus();
    });
  },
  beforeMount() {
    this.getChatHistory();
    // 清除用户发送给当前用户的已读信息
    this.socket.emit('clearUnreadMsg', {
      from: this.toUser.username,
      to: this.userInfo.username,
    });
  },
  mounted() {
    this.goBottom();
  },
};
</script>

<style lang="scss" scoped>
.chat-container {
  height: 100%;
  padding-top: 60px;
  background-color: #fff;
  .nav-bar {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    line-height: 60px;
    .back {
      height: 40px;
      width: 40px;
      line-height: 40px;
      font-size: 0;
      img {
        width: 30px;
        height: 30px;
        vertical-align: middle;
      }
    }
  }
  .chat-list {
    height: calc(100% - 110px);
    position: relative;
    overflow-y: auto;
    .chat-item {
      height: 50px;
      line-height: 50px;
      padding: 10px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .avatar {
        font-size: 0;
        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          vertical-align: middle;
        }
      }
      .content {
        height: 40px;
        line-height: 40px;
        background-color: skyblue;
        border-radius: 10px;
        padding: 0 15px;
        position: relative;
        margin: 0 15px;
      }
      .right {
        background-color: skyblue;
        &::after {
          position: absolute;
          content: '';
          top: 15px;
          right: -15px;
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-left: 10px solid skyblue;
        }
      }
      .left {
        background-color: #eee;
        &::before {
          position: absolute;
          content: '';
          top: 15px;
          left: -15px;
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-right: 10px solid #eee;
        }
      }
    }
    .self {
      justify-content: flex-end;
    }
  }
  .chat-input {
    height: 50px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    .form {
      background: #eee;
      padding: 4px;
      display: flex;
      align-items: center;
      height: 100%;
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      .input {
        height: 25px;
        border: none;
        padding: 4px 10px;
        flex-grow: 1;
        border-radius: 5px;
        margin: 4px;
        font-size: 14px;
        &:focus {
          outline: none;
        }
      }
      .button {
        height: 30px;
        background: skyblue;
        border: none;
        padding: 0 10px;
        margin: 4px;
        border-radius: 3px;
        outline: none;
        color: #000;
        transition: 0.2s all;
        &:active {
          opacity: 0.6;
          color: #333;
        }
      }
    }
  }
}
</style>
