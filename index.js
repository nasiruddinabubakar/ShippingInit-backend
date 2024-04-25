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

app.use(express.json());
app.use(
  cors({
    origin: [
      'https://shipping-init.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
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

const onlineUsers = new Set(); // Set to store online users

//connection

io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  console.log('user connected with token: ', token);
  onlineUsers.add(token);
  // Broadcast online users to all clients
  io.emit('onlineUsers', Array.from(onlineUsers));

  //chat room
  socket.on('joinChatRoom', ({ user_id, company_id }) => {
    const chatRoom = `${user_id}_${company_id}`; // Unique room identifier
    socket.join(chatRoom);
    console.log('user joined chat room', chatRoom);
  });
  socket.on(
    'sendMessage',
    ({ user_id, company_id, sender_id, receiver_id, message }) => {
      const chatRoom = `${user_id}_${company_id}`;
      console.log('user sent message to chat room', chatRoom, message);
      io.to(chatRoom).emit('newMessage', { sender_id, receiver_id, message });
    }
  );

  // Disconnect event
  socket.on('disconnect', async () => {
    console.log('user disconnected with id', token);
    onlineUsers.delete(token);

    console.log(onlineUsers);
    // Broadcast updated online users to all clients
    io.emit('onlineUsers', Array.from(onlineUsers));
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
