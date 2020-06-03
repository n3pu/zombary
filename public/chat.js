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
  let usersList = $("#users_list");
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
    if(keycode == '13' && message.val().length != 0){
      socket.emit('new_message', {message : message.val()});
    }
  })

  //Listen on new_message
  socket.on("new_message", (data) => {
    feedback.html('');
    message.val('');
    //align and color chat balloon
    var userColorClass = "other";
    if( nickName.val() === data.username ) {
      userColorClass = "self";
    }
    //append the new message on the chatroom
    chatroom.append(`
    
    <div class="${userColorClass}">
      <div class="user-message">
        <div style='color:${data.color}' class="author">${data.username}</div>
        <div class="content-message">${data.message}</div>
      </div>
    </div>  
    
    `)
    keepTheChatRoomToTheBottom()
  });

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
          html += `<li class="list-item" style="color: ${data[i].color}" ${data[i].id}>${data[i].username}</li>`;
        }
        usersList.html(html)
      })
    }
  });

  //Emit typing
  var typingTimer;
  var doneTypingInterval = 2000;
  message.on("keypress", e => {
    let keycode = (e.keyCode ? e.keyCode : e.which);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
    if (keycode != '13'){
      socket.emit('typing', {typing: true})
    } 
  });

  // clear typing after interval
  function doneTyping() {
    socket.emit('typing', {typing : false});
  }

  //Listen on typing
  socket.on('typing', (data) => {
    if (data.typing==true) {
      feedback.html("<i><span style='color:"+ data.color +"'>" + data.username + "</span> está digitando uma mensagem..." + "</i>")
    } else {
      feedback.html('')
    }
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

});

// function thats keeps the chatbox stick to the bottom
const keepTheChatRoomToTheBottom = () => {
  const chatroom = document.getElementById('chatroom');
  chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
}


function openUsers() {
  document.getElementById("users_list").classList.toggle('show')
}