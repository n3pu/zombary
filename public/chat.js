$(document).ready(function() {
  var container = document.getElementById("chatroom");
  setTimeout(function(){
    $('#chatroom').animate({ scrollTop: container.scrollHeight}, 1000);
  },1000);    
});

// Get the modal
var modal = document.getElementById("username-modal");
const nicknameInput = document.getElementById("username");

// Close modal when nick-name is typed
nicknameInput.onkeypress = e => {
  let keycode = (e.keyCode ? e.keyCode : e.which);
  if(keycode == '13'){
      modal.style.display = "none";
  }
};

$(function () {
  var socket = io.connect();

  let nickName = $("#username");
  let send_message = $("#send_message");
  let message = $("#message");
  let feedback = $("#feedback");
  let usersList = $("#users-list");
  let chatroom = $("#chatroom");
  let currentUser = $("#current_user");

  //Emit message
  // If send message btn is clicked
  send_message.click(function(){
    socket.emit('new_message', {message : message.val()})
  });

  // Or if the enter key is pressed
  message.keypress( e => {
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if(keycode == '13'){
      socket.emit('new_message', {message : message.val()})
    }
  })

  //Listen on new_message
  socket.on("new_message", (data) => {
    feedback.html('');
    message.val('');
    //append the new message on the chatroom
    chatroom.append(`
    
    <div class="">
      <div class="user-message">
        <div style='color:${data.color}' class="author">${data.username}</div>
        <div class="content-message">${data.message}</div>
      </div>
    </div>  
    
    `)
    keepTheChatRoomToTheBottom()
  });

  // function renderMessage(message) {
  //   var currentAuthor = message.id;
  //   var userColorClass = "other";
  //   if( currentAuthor === socket.id ) {
  //     userColorClass = "self";
  //   }
  //   $('.messages').append('<div class="message '+ userColorClass +'"><div class="user-message"><div class="author">'
  //     + message.author +'</div><div class="content-message">'
  //     + message.message +'</div></div></div>');
  // }

  //Emit a username
  nickName.keypress( e => {
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if(keycode == '13'){
      socket.emit('change_username', {nickName : nickName.val()});
      currentUser.append(`
        <div class="current-user">${nickName.val()}</div>
      `);
      socket.on('get users', data => {
        let html = '';
        for(let i=0;i<data.length;i++){
          html += `<li class="list-item" style="color: ${data[i].color}">${data[i].username}</li>`;
        }
        usersList.html(html)
      })
    }
  });

  //Emit typing
  message.on("keypress", e => {
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if(keycode != '13'){
      socket.emit('typing')
    }
  });

  //Listen on typing
  socket.on('typing', (data) => {
    feedback.html("<i><span style='color:"+ data.color +"'>" + data.username + "</span> está digitando uma mensagem..." + "</i>")
  });

  socket.on('previousMessages', function(messages) {
    for (message of messages) {
      renderMessage(message);
    }
  });

  socket.on('receiveMessage', function(message) {
    renderMessage(message);
    var container = document.getElementById("messages");    
    $('#messages').animate({ scrollTop: container.scrollHeight}, 1000);
  });

  // $('#chat').submit(function(event){
  //   event.preventDefault();

  //   if (nickName.length && message.length) {
  //     var messageObject = {
  //       nickName: nickName,
  //       message: message,
  //       id: socket.id
  //     };

  //     renderMessage(messageObject);

  //     socket.emit('sendMessage', messageObject);
  //   }
  //   var container = document.getElementById("messages");    
  //   $('#messages').animate({ scrollTop: container.scrollHeight}, 1000);
  // });

});

// function thats keeps the chatbox stick to the bottom
const keepTheChatRoomToTheBottom = () => {
  const chatroom = document.getElementById('chatroom');
  chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
}