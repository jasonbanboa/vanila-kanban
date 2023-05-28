import { 
  generateUniqueID,
  $, 
  $$,
} from '../lib/util.js' 

console.log(generateUniqueID());

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

function getDragAfterSection() {
  
}