import { 
  $, 
  $$,
  generateUniqueID,
  getKanbanData,
  updateKanbanData,
  mockData,
} from '../lib/util.js' 


// localStorage.setItem('kanban', JSON.stringify(mockData));


const $main = $('.workspace main'); 

// NOTE !IMPORTANT
// these eventListeners need to be updated when new sections or todos are added
function addDynamicEventListeners(workspace) {

  // section eventListeners
  const $sectionContainers = $$('.section-container');
  const $sections = $$('.section');
  
  $sections.forEach(($section) => {
    $section.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      $section.classList.add('is-dragging');
    });
  
    $section.addEventListener('dragend', (e) => {
      e.stopPropagation();
      $section.classList.remove('is-dragging');

      // when drag event is ended order of the section is checked and reduced down to an array of sectionID 
      const sectionIDOrderArr = $$('.section').reduce((acc, { dataset: { index }}) => [...acc, index],[]);
      console.log(sectionIDOrderArr);

      // sort the workspace to the correct order;
      const orderedSections = sectionIDOrderArr.reduce((sections, sectionIDFromArr) => {
        const section = workspace.sections.find(({ sectionID }) => sectionIDFromArr === sectionID);
        return [...sections, section];      
      }, []);
      
      // set the correctly ordered sections to temp workspace object
      const tempWorkspace = structuredClone(workspace);
      tempWorkspace.sections = orderedSections;
      
      const kanbanData = getKanbanData();
      const workspaceArrayIndex = kanbanData.workspaces.findIndex(({ workspaceID }) => workspaceID === workspace.workspaceID);

      // update kanban data to have correctly ordered section 
      kanbanData.workspaces[workspaceArrayIndex] = tempWorkspace;

      // set updated data to localStorage
      updateKanbanData(kanbanData);
    });
  });
  
  $sectionContainers.forEach(($sectionContainer) => {
    $sectionContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
  
      const $currentSection = $('.is-dragging:not(.todo)');
      if (!$currentSection) return;
  
      const $currentSectionContainer = $currentSection.closest('.section-container');
      const $sectionToBeSwitched = $sectionContainer.querySelector('.section');
  
      $currentSectionContainer.append($sectionToBeSwitched);
      $sectionContainer.append($currentSection);
    });
  }); 
  
  // todo eventListeners
  const $todos = $$('.todo');
  const $sectionsBodies = $$('.section-body');
  
  $todos.forEach(($todo) => {
    $todo.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      $todo.classList.add('is-dragging');
    });
    $todo.addEventListener('dragend', (e) => {
      e.stopPropagation();
      $todo.classList.remove('is-dragging');
      console.log(workspace, 'drag ended update me');

    });
  });
  
  $sectionsBodies.forEach($section => {
    $section.addEventListener('dragover', (e) => {
      e.preventDefault(); 
      
      const $currentTodo = $('.is-dragging:not(.section)');
      
      if (!$currentTodo) return;
      
      const $bottomTodo = getDragAfterTodo($section, e.clientY);
      if ($bottomTodo) {
        $section.insertBefore($currentTodo, $bottomTodo);
      } else {
        $section.append($currentTodo);
      }
    });
  });
}

function getDragAfterTodo($section, mouseY) {
  const $todos = [...$section.querySelectorAll('.todo:not(.is-dragging)')];

  return $todos.reduce((closest, $todo) => {
    const box = $todo.getBoundingClientRect();
    const offset = mouseY - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: $todo };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}


// renders workspaces and if no workspace 
function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const WORKSPACE_ID = urlParams.get('workspaceID');

  const kanbanData = getKanbanData();

  // TODO render view that tells user to create new section; 
  if (!kanbanData) {
    return;
  }

  const { workspaces } = kanbanData;
  const workspace = workspaces.find(({ workspaceID }) => workspaceID === WORKSPACE_ID);

  renderWorkspace(workspace);

  addDynamicEventListeners(workspace);

}

// renders workspace
function renderWorkspace({ sections }) {
  sections.forEach(({ sectionName, sectionID, todos }, i) => {
    const $section = document.createElement('div');
    $section.className = 'section-container';
    $section.innerHTML = `
      <div data-index="${sectionID}" class="section" draggable="true">
        <div class="section-head flex">
          <h4 class="section-title">${sectionName}</h4>
          <span class="ml-auto actions pointer" role="button">...</span>
        </div>
        <div class="section-body">
          ${todos.reduce((bodyHTML, { todoName }) => {
            return bodyHTML += `<div class="todo flex" draggable="true">
              <p class="todo-title">${todoName}</p>
              <span class="edit ml-auto none" role="button"></span>
            </div>`;
          }, '')}
        </div>
      </div>
    `;
    $main.append($section);
  });
}

window.onload = () => {
  main();
} 