<template>
  <div class="home-container">
    <choose-user
      v-if="!myaccount"
      :userList="userList"
      @myUserInfo="getMyUserInfo"
      :socket="socketObj"
    ></choose-user>
    <user-list
      v-if="myaccount && !isChat"
      :isLogin="isLogin"
      :userInfo="myaccount"
      :users="users"
      :unReadList="unReadList"
      :onlineUnread="onlineUnread"
      @choose-user="chooseUser"
    ></user-list>
    <chat
      v-if="isChat"
      :toUser="toUser"
      :userInfo="myaccount"
      :isLogin="isLogin"
      @closeChat="closeChat"
      :socket="socketObj"
      :newMsgObj="newMsgObj"
    ></chat>
  </div>
</template>

<script>
import ChooseUser from './components/ChooseUser.vue';
import UserList from './components/UserList.vue';
import Chat from './components/Chat.vue';
import axios from 'axios';
import socket from '@/utils/socket.js';
export default {
  name: 'Home',
  components: {
    ChooseUser,
    UserList,
    Chat,
  },
  data() {
    return {
      // 所有用户
      userList: [],
      // 当前用户信息（我）
      myaccount: null,
      // 是否登录（头像颜色）
      isLogin: false,
      // 数据库获取的当前列表
      users: [],
      // 聊天对象
      toUser: null,
      // 是否在聊天界面
      isChat: false,
      // 刚上线用户
      newsocketid: '',
      socketObj: {},
      // 未读消息的用户列表
      unReadList: [],
      // 在线未读用户消息（列表）
      onlineUnread: [],
      // 新增的消息
      newMsgObj: {},
    };
  },
  watch: {},
  methods: {
    async getUserList() {
      const res = await axios.get('http://127.0.0.1:3000/api/userlist');
      console.log(res);
      this.userList = res.data;
      this.users = res.data;
    },
    getMyUserInfo(userInfo) {
      this.myaccount = userInfo;
    },
    // 选择要聊天的对象
    chooseUser(user) {
      this.toUser = user;
      this.onlineUnread = this.onlineUnread.filter(
        (item) => item !== user.username
      );
      this.isChat = true;
    },
    closeChat() {
      this.isChat = false;
    },
    // 连接socket.io
    getSocket() {
      this.socketObj = socket;
      // 监听登录成功，isLogin设置为true
      socket.on('login', (data) => {
        console.log(data);
        if (data.state === 'ok') {
          this.isLogin = true;
          socket.emit('users');
        }
      });
      // 监听登出事件
      socket.on('logout', (data) => {
        console.log(data);
        this.isLogin = false;
        alert('账号异地登录');
        socket.disconnect();
      });
      // 断开连接
      socket.on('disconnect', () => {
        console.log('断开连接');
      });
      // 更新当前用户信息
      socket.on('users', (data) => {
        this.users = data[0];
        console.log(data);
        const newUser = data[0].filter(
          (item) => item.socketid === this.newsocketid
        );
        if (data[1] === 'true') {
          alert(newUser[0].username + '已上线');
        } else {
          alert('有用户下线了！');
        }
      });
      // 有新用户登录
      socket.on('newUserLogin', (data) => {
        this.newsocketid = data;
        console.log(data, 123);
      });

      // 接收未读消息
      socket.on('unreadMsg', (data) => {
        this.unReadList = [];
        data.forEach((item, index) => {
          // 设置未读红点
          // 将聊天内容分别添加到本地的存储
          // from和to由username改成对应的对象
          item.from = this.users.filter(
            (citem) => citem.username === item.from
          )[0];
          item.to = this.users.filter((citem) => citem.username === item.to)[0];

          this.unReadList.push(item.from.username);
          // 把聊天内容分别保存到本地存储
          const chatKey = `${this.myaccount.id}-chat_with-${item.from.id}`;
          if (localStorage[chatKey]) {
            // 如果本地存在该键名
            const arr = JSON.parse(localStorage[chatKey]);
            arr.push(item);
            localStorage[chatKey] = JSON.stringify(arr);
          } else {
            // 如果本地不存在该键名
            localStorage[chatKey] = JSON.stringify([item]);
          }
          // 此时的to为修改格式后的对象
          // 清空当前用户得未读消息
          // socket.emit('clearUnreadMsg', item.to.username);
        });
      });

      // 在线接收消息
      socket.on('receivemsg', (msg) => {
        // 把聊天内容分别保存到本地存储
        const chatKey = `${this.myaccount.id}-chat_with-${msg.from.id}`;
        if (localStorage[chatKey]) {
          // 如果本地存在该键名
          const arr = JSON.parse(localStorage[chatKey]);
          arr.push(msg);
          localStorage[chatKey] = JSON.stringify(arr);
        } else {
          // 如果本地不存在该键名
          localStorage[chatKey] = JSON.stringify([msg]);
        }
        console.log('-----------------------------');
        console.log(msg.to.username, this.myaccount.username);
        console.log(this.toUser.username, msg.from.username);
        console.log('-----------------------------');
        // 用户在聊天界面
        // 如果当前消息来自当前聊天用户
        if (
          this.isChat &&
          msg.to.username === this.myaccount.username &&
          this.toUser.username === msg.from.username
        ) {
          // 用newMsgObj保存消息待传到聊天页面添加到聊天列表数组
          this.newMsgObj = { ...msg };
        } else {
          // 如果当前消息不是来自来自当前聊天用户  或者  用户不在聊天界面

          this.onlineUnread.push(msg.from.username);
          // console.log(this.onlineUnread);
        }
      });
    },
  },
  created() {},
  beforeMount() {
    this.getUserList();
  },
  mounted() {
    this.getSocket();
  },
};
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
  overflow: hidden;
}
</style>
