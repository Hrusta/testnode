const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

app.use(session({ secret: 'tajna', resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let users = []; // { id, username, password }
let projects = []; 
// Svaki projekt: { id, title, description, owner, tasks: [{ id, title, description, status, assignedTo }], chat: [{ username, message, date }] }
let currentUserId = 1;
let currentProjectId = 1;
let currentTaskId = 1;

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Obavezna polja' });
  if (users.find(u => u.username === username))
    return res.status(400).json({ success: false, message: 'Korisničko ime već postoji' });
  const newUser = { id: currentUserId++, username, password };
  users.push(newUser);
  res.json({ success: true, message: 'Registracija uspješna' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user)
    return res.status(400).json({ success: false, message: 'Neispravni kredencijali' });
  req.session.user = user;
  res.json({ success: true, message: 'Prijava uspješna', user });
});

app.get('/api/user', (req, res) => {
  if (req.session.user)
    return res.json({ loggedIn: true, user: req.session.user });
  res.json({ loggedIn: false });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Odjava uspješna' });
});

app.post('/api/projects', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: 'Prijava je potrebna.' });
  const { title, description } = req.body;
  if (!title || !description)
    return res.status(400).json({ success: false, message: 'Naslov i opis su obavezni' });
  const newProject = {
    id: currentProjectId++,
    title,
    description,
    owner: req.session.user.username,
    tasks: [],
    chat: []
  };
  projects.push(newProject);
  res.json({ success: true, project: newProject });
});

app.get('/api/projects', (req, res) => {
  res.json({ success: true, projects });
});

app.get('/api/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);
  if (!project)
    return res.status(404).json({ success: false, message: 'Projekt nije pronađen' });
  res.json({ success: true, project });
});

app.put('/api/projects/:id', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: 'Prijava je potrebna' });
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);
  if (!project)
    return res.status(404).json({ success: false, message: 'Projekt nije pronađen' });
  if (project.owner !== req.session.user.username)
    return res.status(403).json({ success: false, message: 'Nemate ovlasti za uređivanje ovog projekta' });
  const { title, description } = req.body;
  if (title) project.title = title;
  if (description) project.description = description;
  res.json({ success: true, project });
});

app.post('/api/projects/:id/tasks', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: 'Prijava je potrebna' });
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);
  if (!project)
    return res.status(404).json({ success: false, message: 'Projekt nije pronađen' });
  const { title, description, assignedTo } = req.body;
  if (!title || !description)
    return res.status(400).json({ success: false, message: 'Naslov i opis zadatka su obavezni' });
  const newTask = {
    id: currentTaskId++,
    title,
    description,
    status: 'To Do',
    assignedTo: assignedTo || null
  };
  project.tasks.push(newTask);
  res.json({ success: true, task: newTask });
});

app.put('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: 'Prijava je potrebna' });
  const projectId = parseInt(req.params.projectId);
  const taskId = parseInt(req.params.taskId);
  const project = projects.find(p => p.id === projectId);
  if (!project)
    return res.status(404).json({ success: false, message: 'Projekt nije pronađen' });
  const task = project.tasks.find(t => t.id === taskId);
  if (!task)
    return res.status(404).json({ success: false, message: 'Zadatak nije pronađen' });
  const { status, assignedTo } = req.body;
  if (status) task.status = status;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;
  res.json({ success: true, task });
});

io.on('connection', (socket) => {
  socket.on('joinProject', (projectId) => {
    socket.join(`project-${projectId}`);
  });
  socket.on('chatMessage', (data) => {
    const project = projects.find(p => p.id === parseInt(data.projectId));
    if (project) {
      const newMsg = { username: data.username, message: data.message, date: new Date().toLocaleString() };
      project.chat.push(newMsg);
      io.to(`project-${data.projectId}`).emit('chatMessage', newMsg);
    }
  });
  socket.on('disconnect', () => {});
});

server.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
