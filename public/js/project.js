document.addEventListener('DOMContentLoaded', function(){
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  fetch(`/api/projects/${projectId}`)
    .then(res => res.json())
    .then(data => {
      if(data.success){
        const project = data.project;
        document.getElementById('projectTitle').textContent = project.title;
        document.getElementById('projectDetails').innerHTML = `<p>${project.description}</p><p>Autor: ${project.owner}</p>`;
        document.getElementById('chatLink').href = `chat.html?id=${project.id}`;
        const toDo = document.getElementById('toDoColumn');
        const inProgress = document.getElementById('inProgressColumn');
        const done = document.getElementById('doneColumn');
        toDo.innerHTML += project.tasks.filter(t => t.status === 'To Do').map(t => `<div class="post-preview"><p>${t.title}</p></div>`).join('');
        inProgress.innerHTML += project.tasks.filter(t => t.status === 'In Progress').map(t => `<div class="post-preview"><p>${t.title}</p></div>`).join('');
        done.innerHTML += project.tasks.filter(t => t.status === 'Done').map(t => `<div class="post-preview"><p>${t.title}</p></div>`).join('');
      }
    })
    .catch(err => { console.error(err); });
});
