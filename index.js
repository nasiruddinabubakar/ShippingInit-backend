const express = require('express');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const AppError = require('./utils/appError');
const shipRoutes = require('./routes/shipRoutes');
const companyRoutes = require('./routes/companyRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const globalErrorHandler = require('./controllers/errorController');
const con = require('./database/db');
const app = express();
const { v4: uuidv4 } = require('uuid');
const util = require('util');

const query = util.promisify(con.query).bind(con);

app.use(express.json());
app.use(
  cors({
    origin:'*'
  })
);
//mount user routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ships', shipRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/messages', chatRoutes);

const http = require('http');
// const server = http.createServer(app)

const { Server } = require('socket.io');
const { Socket } = require('dgram');

const server = app.listen(5000, () => {
  console.log('listening...');
});
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const socketIdMap = {}; // Set to store online users

//connection

io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  console.log('user connected with token: ', token);
  const socketID = socket.id;
  socketIdMap[token] = socketID;

  // Broadcast online users to all clients
  io.emit('onlineUsers',Object.keys(socketIdMap));

  //chat room
  socket.on('joinChatRoom', async ({ user_id, company_id }) => {
    const chatRoom = `${user_id}_${company_id}`; // Unique room identifier
    const chats = await query(
      `
    SELECT *
    FROM messages
    WHERE (sender_id = ? AND recipient_id = ?)
       OR (sender_id = ? AND recipient_id = ?)
    ORDER BY timestamp;
`,
      [user_id, company_id, company_id, user_id]
    );

    console.log(chats);
    socket.emit('chatHistory', { chats });

    socket.join(chatRoom);
    console.log('user joined chat room', chatRoom);
 
  });
  socket.on(
    'sendMessage',
    async ({ user_id, company_id, sender_id, receiver_id, message }) => {
      const chatRoom = `${user_id}_${company_id}`;
      console.log('user sent message to chat room', chatRoom, message);
      await query(
        'INSERT INTO messages (message_id, sender_id, recipient_id, message,timestamp,isRead) VALUES (?, ?, ?, ?,CURRENT_TIMESTAMP,?)',
        [uuidv4(), sender_id, receiver_id, message,1]
      );
      const room = io.sockets.adapter.rooms.get(chatRoom);
      const clients = room ? Array.from(room) : [];
      if (clients.length === 1) {
        const receiverSocketId = socketIdMap[receiver_id];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newnotification', {
            sender_id,
            receiver_id,
            message,
          });
        }
      }
      io.to(chatRoom).emit('newMessage', { sender_id, receiver_id, message });
    }
  );

  // Disconnect event
  socket.on('disconnect', async () => {
    console.log('user disconnected with id', token);
    delete socketIdMap[token];

    console.log(socketIdMap);
    // Broadcast updated online users to all clients
    io.emit('onlineUsers',Object.keys(socketIdMap));
  });
});

app.get('/api/countries', async (req, res) => {
  const countries = await new Promise((resolve, reject) => {
    con.query(
      `SELECT start_country AS country
    FROM route
    UNION
    SELECT country
    FROM lag;
    `,
      (err, result) => {
        console.log(result);
        if (err) reject(err);
        resolve(result);
      }
    );
    // console
  });
  return res.status(200).json({ status: 'success', countries });
});
app.all('*', (req, res, next) => {
  next(new AppError(`Cant Find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;