const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;

const uuid = require('uuid');

let randomColor = require('randomcolor');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
  res.render('index.html');
});

let messages = [];
let users = [];
let connections = [];

io.on('connection', socket => {
  console.log(`Socket connected ${socket.id}`);

  connections.push(socket)

  //initialize a random color for the socket
  let color = randomColor();

  socket.username = 'Anonymous';
  socket.color = color;

  socket.emit('previousMessages', messages);

  socket.on('sendMessage', data => {
    messages.push(data);
    socket.broadcast.emit('receiveMessage', data);
  });

  //listen on change_username
  socket.on('change_username', data => {
    let id = uuid.v4();;
    socket.id = id;
    socket.username = data.nickName;
    users.push({id, username: socket.username, color: socket.color});
    updateUsernames();
  });

  //update Usernames in the client
  const updateUsernames = () => {
    io.sockets.emit('get users', users);
  }

  //listen on new_message
  socket.on('new_message', (data) => {
    //broadcast the new message
    io.sockets.emit('new_message', {message : data.message, username : socket.username, color: socket.color});
  });


  //listen on typing
  socket.on('typing', data => {
    socket.broadcast.emit('typing',{username: socket.username})
  });

  //Disconnect
  socket.on('disconnect', data => {

    if(!socket.username)
        return;
    //find the user and delete from the users list
    let user = undefined;
    for(let i= 0;i<users.length;i++){
        if(users[i].id === socket.id){
            user = users[i];
            break;
        }
    }
    users = users.filter( x => x !== user);
    //Update the users list
    updateUsernames();
    connnections.splice(connnections.indexOf(socket),1);
  });

});

server.listen(PORT, () => {
  console.log(`Our app is running on port ${ PORT }`);
});