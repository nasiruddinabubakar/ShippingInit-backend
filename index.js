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



io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  console.log('user connected with token: ', token);
  onlineUsers.add(token);
  // Broadcast online users to all clients
  io.emit('onlineUsers', Array.from(onlineUsers));


  
 
  socket.on('messege', async (messege) => {
    io.emit('messege', messege);
  });
  socket.on("bye",(user_id)=>{
    console.log('user disconnected with id',user_id);
    onlineUsers.delete(user_id);
  })
  socket.on('disconnect', async () => {
    console.log('user disconnected with id');
    // onlineUsers.delete(socket.id);

    console.log(onlineUsers);
    // Broadcast updated online users to all clients
    io.emit('onlineUsers', Array.from(onlineUsers));

   
   
  });
  socket.on('joinChatRoom', ({ userId, companyId }) => {
    const chatRoom = `${userId}_${companyId}`; // Unique room identifier
    socket.join(chatRoom);
  });
  socket.on('sendMessage', ({ userId, companyId, message }) => {
    const chatRoom = `${userId}_${companyId}`;
    io.to(chatRoom).emit('newMessage', { userId, companyId, message });
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
