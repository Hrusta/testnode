const socket = io();
const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');
const currentUser = localStorage.getItem('currentUser') || 'Anon';

if (projectId) {
  socket.emit('joinProject', projectId);
}

document.getElementById('chatForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const msg = document.getElementById('chatMsg').value.trim();
  if (msg !== '') {
    socket.emit('chatMessage', { projectId, username: currentUser, message: msg });
    document.getElementById('chatMsg').value = '';
  }
});

socket.on('chatMessage', function(data) {
  const chatBox = document.getElementById('chatBox');
  const messageDiv = document.createElement('div');
  messageDiv.textContent = `${data.username} (${data.date}): ${data.message}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
