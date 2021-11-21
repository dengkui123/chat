const socketio = {};
const sqlQuery = require('./module/lcMysql')
function getSocket(server) {

  socketio.io = require('socket.io')(server, { cors: true });

  let io = socketio.io;

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected');

    socket.on('disconnect', async () => {
      console.log('user disconnected');
      let sqlStr = "update user set socketid=?,isonline=? where socketid=?"
      await sqlQuery(sqlStr, [null, 'false', socket.id]);
      // 用户断开连接，更新用户在线状态
      let sqlStr1 = "select * from user";
      // 等待mysql查询结果
      let res = await sqlQuery(sqlStr1);
      socket.broadcast.emit('users', [Array.from(res), 'false']);
    });
    // 接受登录事件
    socket.on('login', async (data) => {
      // 先判断是否已经有人在登录，如果有人登录的话，将其断开连接
      let sqlStr1 = 'select * from user where isonline= ? and username = ?'
      let result1 = await sqlQuery(sqlStr1, ['true', data.username])
      if (result1.length > 0) {
        // 如果已经登录，发送消息给该客户端
        socket.to(result1[0].socketid).emit('logout', '当前帐号异地登陆');
      }
      //修改数据库登录信息（socketid，isonline）
      let sqlStr = "update user set socketid=?,isonline=? where username=?"
      let result = await sqlQuery(sqlStr, [socket.id, 'true', data.username]);
      socket.emit('login', {
        state: 'ok',
        content: '登录成功'
      })
      socket.broadcast.emit('newUserLogin', socket.id);

      // 最新未接收的消息
      let sqlStr2 = 'select * from chat where isread= ? and `to`= ?';
      let result2 = await sqlQuery(sqlStr2, ['false', data.username]);
      socket.emit('unreadMsg', Array.from(result2));
    })



    // 新用户加入，重新获取用户在线状态返回并广播给用户
    socket.on('users', async (data) => {
      let sqlStr = "select * from user";
      // 等待mysql查询结果
      let res = await sqlQuery(sqlStr);
      socket.broadcast.emit('users', [Array.from(res), 'true']);
    });



    // 接收发送方用户的消息
    socket.on('sendMsg', async (data) => {
      const msg = data;
      //判断是否在线
      const strSql = 'select * from user where username = ? and isonline= ?';
      const res = await sqlQuery(strSql, [msg.to.username, 'true']);
      if (res.length > 0) {
        // 如果在线则发送消息
        let toid = res[0].socketid;
        socket.to(toid).emit('receivemsg', msg);
        // 将聊天内容保存到数据库
        let strSql1 = 'insert into chat (`from`,`to`,content,`time`,isread) values (?,?,?,?,?)';
        let arr = [msg.from.username, msg.to.username, msg.content, msg.time, 'true'];
        sqlQuery(strSql1, arr);
      } else {
        // 对方不在线，直接存数据
        let strSql1 = 'insert into chat (`from`,`to`,content,`time`,isread) values (?,?,?,?,?)';
        let arr = [msg.from.username, msg.to.username, msg.content, msg.time, 'false'];
        sqlQuery(strSql1, arr);
      }
    })
    //修改已读用户的消息为true,下次用户登录不再获取该条数据
    socket.on('clearUnreadMsg', async (data) => {
      console.log(data);
      let sqlStr = 'update chat set isread=? where `from` = ? and `to` = ?';
      sqlQuery(sqlStr, ['true', data.from, data.to]);
      // 修改数据库消息状态完成

      // 再次获取最新未接收的消息发送给用户
      let sqlStr2 = 'select * from chat where isread= ? and `to`= ?';
      let result2 = await sqlQuery(sqlStr2, ['false', data.to]);
      socket.emit('unreadMsg', Array.from(result2));
    })
    //删除已读消息
    // socket.on('clearUnreadMsg', data => {
    //   let sqlStr = 'delete from chat where `from`=? and`to` = ?';
    //   sqlQuery(sqlStr, [data.from,data.to]);
    // })
  })
}

socketio.getSocket = getSocket;

module.exports = socketio