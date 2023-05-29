import { 
  $, 
  $$,
  getKanbanData,
  updateKanbanData,
  getCurrentWorkspace,
  getDragAfterTodo,
  getLiveIDsArray,
  findWorkspaceArrIndex,
  findSectionArrIndex,
} from '../lib/util.js' 

export function dragHandler() {
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

      // sort the workspace to the correct order;
      const orderedSections = liveSectionIDOrderArr.reduce((sections, sectionIDFromArr) => {
        const section = workspace.sections.find(({ sectionID }) => sectionIDFromArr === sectionID);
        return [...sections, section];      
      }, []);
      
      // set the correctly ordered sections to temp workspace object
      const tempWorkspace = structuredClone(workspace);
      tempWorkspace.sections = orderedSections;
      
      const kanbanData = getKanbanData();
      const workspaceArrayIndex = findWorkspaceArrIndex(kanbanData, workspace);

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

    $todo.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      $todo.classList.add('is-dragging');
    });

    $todo.addEventListener('dragend', (e) => {
      e.stopPropagation();
      $todo.classList.remove('is-dragging');

      const workspace = getCurrentWorkspace();

      // 0. find the section that is being edited
      const currentSectionArrIndex = findSectionArrIndex(workspace, originalSectionID);

      // 1. find the todo that was dragged from kanban data then clone
      const draggedTodoID = $todo.dataset.index;
      const draggedTodoClone = structuredClone(workspace.sections[currentSectionArrIndex].todos.find(({ todoID }) => todoID === draggedTodoID));

      // 2. remove the todo from kanban data
      const removedDragginTodofromTodos = workspace.sections[currentSectionArrIndex].todos.filter(({ todoID }) => todoID !== draggedTodoID);
      workspace.sections[currentSectionArrIndex].todos = removedDragginTodofromTodos;

      // 3. find the live todo order using
      const $relocatedSection = $todo.closest('.section');
      const relocatedSectionID = $relocatedSection.dataset.index;

      const relocatedSectionArrIndex = findSectionArrIndex(workspace, relocatedSectionID);

      const liveTodosIDOrders = getLiveIDsArray([...$relocatedSection.querySelectorAll('.todo')]);
      
      // 4. sort the kanban data
      const orderedTodos = liveTodosIDOrders.reduce((todos, currentTodoID) => {
        
        const todo = workspace.sections[relocatedSectionArrIndex].todos.find(({ todoID }) => currentTodoID === todoID);
        if (!todo) 
          return [...todos, draggedTodoClone];
        return [...todos, todo];
      }, []);

      workspace.sections[relocatedSectionArrIndex].todos = orderedTodos;

      // 5. update localStorage
      const kanbanData = getKanbanData();
      const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

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