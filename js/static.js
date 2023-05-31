import { 
  $, 
  getKanbanData,
  updateKanbanData,
  getCurrentWorkspace,
  findWorkspaceArrIndex,
  findSectionArrIndex,
  closeEditDialog,
  generateUniqueID,
} from '../lib/util.js' 

const $workspaceNameeContainer = $('.workspace-title-conditional-render');
const $workspaceName = $workspaceNameeContainer.querySelector('.workspace-name');
const $editForm = $workspaceNameeContainer.querySelector('.edit-workspace-name');

const $editTodoForm = $('.edit-todo-form');
const $deleteTodo = $('.delete-todo');
const $cancleEditTodo = $('.cancel-edit-todo'); 
const $backdrop = $('.backdrop');

export function addStaticEventListeners() {
  
  const $createNewSection = $('.create-new-section');

  const $newSectionform = $createNewSection.querySelector('.new-section-form');

  $createNewSection.addEventListener('click', () => {  
    if ($newSectionform.classList.contains('none')) {
      $newSectionform.classList.remove('none');
      $createNewSection.classList.add('grow');
      $newSectionform.sectionName.focus();
    }
  });

  $newSectionform.querySelector('input[type="button"]').addEventListener('mousedown', (e) => {
    const input = $newSectionform.sectionName.value.trim();
    if (!input) return;

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();

    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

    const createdSection = {
      sectionID: generateUniqueID(),
      sectionName: input,
      todos: []
    }

    workspace.sections.push(createdSection);
    kanbanData.workspaces[workspaceArrIndex] = workspace;
    $newSectionform.reset();
    $newSectionform.sectionName.blur() 
    updateKanbanData(kanbanData);
  });

  $newSectionform.sectionName.addEventListener('focusout', () => {
    // setTimeout(() => {
      $createNewSection.classList.remove('grow');
      $newSectionform.classList.add('none');
    // }, 100);
  });  
  

  // changing workspace name 
  $workspaceNameeContainer.addEventListener('click', () => {
    
    if ($editForm.classList.contains('none')) {
      $workspaceName.classList.add('none');
      $editForm.classList.remove('none');
      $editForm.workspaceName.value = $workspaceName.textContent; 
      $editForm.workspaceName.focus();
    }

    $editForm.workspaceName.addEventListener('focusout', () => {
      $workspaceName.classList.remove('none');
      $editForm.classList.add('none');
    });

    $editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = e.target.workspaceName.value;
      
      if (!input.trim()) return;

      const kanbanData = getKanbanData();
      const workspace = getCurrentWorkspace();

      const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

      kanbanData.workspaces[workspaceArrIndex].workspaceName = input;

      updateKanbanData(kanbanData);
      $workspaceName.textContent = input;
      $editForm.workspaceName.blur();
    });
  });

  $backdrop.addEventListener('click', (e) => {
    if (e.target === $backdrop) closeEditDialog();
  });

  $cancleEditTodo.onclick = closeEditDialog;

  $editTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { dataset: { todoid: todoID } } = $editTodoForm;
    const { dataset: { sectionid: sectionID } } = $editTodoForm;

    const input = $editTodoForm.editTodo.value;
    if (!input.trim()) return;

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();

    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);
    const sectionArrIndex = findSectionArrIndex(workspace, sectionID);

    const section = kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex];

    const editedTodos = section.todos.reduce((todos, todo) => {
      if (todo.todoID === todoID)
        return [...todos , { ...todo, todoName: input }];
      return [...todos, todo];
    }, []);

    kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex].todos = editedTodos;

    updateKanbanData(kanbanData);
    closeEditDialog();
  });

  $deleteTodo.addEventListener('click', (e) => {
    const { dataset: { todoid: todoID } } = $editTodoForm;
    const { dataset: { sectionid: sectionID } } = $editTodoForm;

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();

    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);
    const sectionArrIndex = findSectionArrIndex(workspace, sectionID);

    const section = kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex];
    const filteredTodos = section.todos.filter((todo) => todo.todoID !== todoID);

    kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex].todos = filteredTodos;

    updateKanbanData(kanbanData);
    closeEditDialog();
  });
}