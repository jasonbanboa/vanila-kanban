# vanila-kanban
kanban board make with vanila js <br>
drag and drop features, crud operations and ect <br>
live preview: https://vanila-kanban.vercel.app/index.html?workspaceID=5nabaxci-XwKg-g1Kq-LNlq <br>

### TODO
refactor + workspace features <br>
fix: cant delete workspace when there is only one <br>

## localstorage
 'kanban' is set in localstorage <br/>
`JSON.parse(localStorage.getItem('kanban'))` returns
```javascript
{
  workspaces: { 
    workspaceID: string,
    workspaceName: string,
    sections: {
      sectionID: string,
      sectionName: string,
      todos: {
        todoID: string,
        todoName: string,
        description: string,
      }[]
    }[]
  }[]
}
```

## util functions
* `generateUniqueID()` => returns unique id; used to set pk for workspace, section, and todos
* ect...

### any function that modifies the kanban will call these function
* `getKanbanData()` => gets kaban data from localStorage then returns data parsed to an js object
* `updateKanbanData(updatedKanbanData)` => takes an object of workspaces, stringifies then updates to localstorage 

```javascript
function modifiesKanbanData() {
  const DATA = getKanbanData();
  // modify data...
  
  updateKanbanData();
}
```


