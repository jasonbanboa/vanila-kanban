import { 
  $, 
  $$,
  generateUniqueID,
  getKanbanData,
  updateKanbanData,
  getCurrentWorkspace,
  mockData,
  getLiveIDsArray,
} from '../lib/util.js' 


// localStorage.setItem('kanban', JSON.stringify(mockData));
// const data = getKanbanData().workspaces[0].workspaceID;
// console.log(data);

const $main = $('.workspace main'); 

// NOTE !IMPORTANT
// these eventListeners need to be updated when new sections or todos are added
function addDynamicEventListeners() {

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

      const workspace = getCurrentWorkspace();

      // when drag event is ended order of the section is checked and reduced down to an array of sectionID
      const liveSectionIDOrderArr = getLiveIDsArray($$('.section'));
      console.log(liveSectionIDOrderArr);

      // sort the workspace to the correct order;
      const orderedSections = liveSectionIDOrderArr.reduce((sections, sectionIDFromArr) => {
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
    const { dataset: { index: originalSectionID }} = $todo.closest('.section');
    console.log(originalSectionID);

    $todo.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      $todo.classList.add('is-dragging');
    });
    $todo.addEventListener('dragend', (e) => {
      e.stopPropagation();
      $todo.classList.remove('is-dragging');

      const workspace = getCurrentWorkspace();

     // 0. find the section that is being edited
      const currentSectionArrIndex = workspace.sections.findIndex(({ sectionID }) => sectionID === originalSectionID);

      // 1. find the todo what was dragged from kanban data
      const draggedTodoID = $todo.dataset.index;
      const draggedTodoClone = {...workspace.sections[currentSectionArrIndex].todos.find(({ todoID }) => todoID === draggedTodoID)};
      // make a clone of the todo so it can be inserted to the correct section when dragend
      console.log(draggedTodoClone);

      // 2. remove the todo from kanban data
      const removedDragginTodofromTodos = workspace.sections[currentSectionArrIndex].todos.filter(({ todoID }) => todoID !== draggedTodoID);
      workspace.sections[currentSectionArrIndex].todos = removedDragginTodofromTodos;

      // todo that has been removed has now be removed from the kanban data
      console.log(workspace);

      // 3. find the live order using the $todo.closest('.section');
      const $relocatedSection = $todo.closest('.section');
      const relocatedSectionID = $relocatedSection.dataset.index;
      const relocatedSectionArrIndex = workspace.sections.findIndex(({ sectionID }) => sectionID === relocatedSectionID);


      const liveTodosIDOrders = getLiveIDsArray([...$relocatedSection.querySelectorAll('.todo')]);
      console.log(liveTodosIDOrders);
      
      // 4. sort the kanban data
      const orderedTodos = liveTodosIDOrders.reduce((todos, currentTodoID) => {
        const todo = workspace.sections[relocatedSectionArrIndex].todos.find(({ todoID }) => currentTodoID === todoID);
        if (!todo) 
          return [...todos, draggedTodoClone];
        return [...todos, todo];
      }, []);

      workspace.sections[relocatedSectionArrIndex].todos = orderedTodos;

      console.log(workspace);
      // 5. update localStorage
      const kanbanData = getKanbanData();
      const workspaceArrIndex = kanbanData.workspaces.findIndex(({ workspaceID }) => workspaceID === workspace.workspaceID);
      kanbanData.workspaces[workspaceArrIndex] = workspace;

      updateKanbanData(kanbanData);
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


function main() {
  
  const kanbanData = getKanbanData();

  // TODO render view that tells user to create new section; 
  if (!kanbanData) {
    throw new Error('TODO SHOW USER THAT THEY HAVE NO WORKSPACE ');
  }

  const workspace = getCurrentWorkspace();
  if (!workspace) {
    throw new Error('TODO SHOW USER INVALID ID');
  }

  renderWorkspace();

  addDynamicEventListeners();

}

// renders workspace
function renderWorkspace() {
  const { sections } = getCurrentWorkspace();

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
          ${todos.reduce((bodyHTML, { todoName, todoID }) => {
            return bodyHTML += `<div data-index="${todoID}" class="todo flex" draggable="true">
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