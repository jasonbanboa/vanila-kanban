import { 
  generateUniqueID,
  $, 
  $$,
} from '../lib/util.js' 

console.log(generateUniqueID());

const $todos = $$('.todo');
const $sections = $$('.section-body');

$todos.forEach(($todo) => {
  $todo.addEventListener('dragstart', () => {
    $todo.classList.add('is-dragging');
  });
  $todo.addEventListener('dragend', () => {
    $todo.classList.remove('is-dragging');
  });
});

$sections.forEach($section => {
  $section.addEventListener('dragover', (e) => {
    e.preventDefault(); 
    
    const $bottomTodo = getDragAfterELement($section, e.clientY);
    const $currentTodo = $('.is-dragging');

    if (!$currentTodo) return;

    console.log($bottomTodo)
    if ($bottomTodo) {
      $section.insertBefore($currentTodo, $bottomTodo);
    } else {
      $section.append($currentTodo);
    }
  });
});

function getDragAfterELement($section, mouseY) {
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
