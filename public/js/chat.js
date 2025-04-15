const socket = io();
const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');
const currentUser = localStorage.getItem('currentUser') || 'Anon';
socket.emit('joinProject', projectId);

document.getElementById('chatForm').addEventListener('submit', function(e){
  e.preventDefault();
  const msg = document.getElementById('chatMsg').value.trim();
  if(msg){
    socket.emit('chatMessage', { projectId, username: currentUser, message: msg });
    document.getElementById('chatMsg').value = '';
  }
});

socket.on('chatMessage', (data) => {
  const chatBox = document.getElementById('chatBox');
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${data.username} (${data.date}): ${data.message}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
