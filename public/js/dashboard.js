document.addEventListener('DOMContentLoaded', function(){
  fetch('/api/projects')
    .then(res => res.json())
    .then(data => {
      const projectsList = document.getElementById('projectsList');
      projectsList.innerHTML = '';
      data.projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('post-preview');
        projectDiv.innerHTML = `<h2>${project.title}</h2>
                                <p>Autor: ${project.owner}</p>
                                <a href="project.html?id=${project.id}" class="btn">Detalji</a>`;
        projectsList.appendChild(projectDiv);
      });
    })
    .catch(err => { console.error(err); });
});
