document.addEventListener("DOMContentLoaded", function () {
	var todo = Object.create(null);
	var ul = document.getElementById("todo-view");
	var input = document.getElementById("todo-item");
	var editing = false;
	var count = 0;

	todo.newTodo = function (evt) {
		evt.preventDefault();

		if (count >= 1000) {

			return;

		}

		var newTodo = input.value;
		var li = document.createElement("li");
		li.setAttribute('data-count', count )
		li.innerHTML = '<input type="checkbox" class="checkbox">' + '<p>' + newTodo + '</p>' + '<i class="material-icons">close</i>';

		if (!newTodo.replace(/\s/g, '').length) {
			input.value = "";
		}
		else
		{
			//using ternary operator to add items to top of list if other items already exist
			(ul.childElementCount == 0) ? ul.appendChild(li) : ul.insertBefore(li, ul.firstChild);

			input.value = "";

			var i = li.getElementsByTagName("i");

			i[0].addEventListener("click", todo.deleteTodo, false);

			var checkbox = li.getElementsByTagName("input");

			checkbox[0].addEventListener("click", todo.finishedTodo, false);

			li.childNodes[1].addEventListener("dblclick", todo.editTodo, false);

			count++;

			//add functionality for an in depth information container for each todo and reference the method here
		}
	}

	var todoCache = [];

	todo.deleteTodo = function () {
		todoCache.push(this.parentNode);


		//targets the ul element in order to remove todo(li)
		this.parentNode.parentNode.removeChild(this.parentNode); 

		return todoCache;
	}

	todo.undoDelete = function (evt) {
		evt.preventDefault();

		if (todoCache.length > 0 ) {

			//sets var lastTodo to the index of the last element in the array
			var lastTodo = todoCache.length - 1;

			//places the last deleted todo element back into the ul element
			ul.appendChild(todoCache[lastTodo]);

			//removes the last todo element from the array
			todoCache.pop();
		}

		else {
			alert('There are no more deleted entries.');
		}
	}

	todo.finishedTodo = function () {
		//using ternary operator to check for finished todo items
		(this.checked) ? this.parentNode.classList.add('line-through') : this.parentNode.classList.remove('line-through');

	}

	todo.editTodo = function () {
		//if something is already being edited, dont allow something else to be edited
		if (editing == true) {
			return;
		}

		else {
			var todoVal = this.innerHTML;
			var input = document.createElement('input');

			editing = true;

			//set input value to the text currently shown within the todo
			input.value = todoVal;
			//empty the text currently within the container
			this.innerHTML = '';
			//place the input into the container
			this.appendChild(input);

			input.addEventListener("keydown", todo.saveEdit, false);

			//allow for the edit to be saved when the li element is clicked on
			input.parentNode.parentNode.addEventListener("click", todo.saveEditAlt, false);

			//stop the function above from bubbling down to the input
			input.addEventListener("click", function (evt) { evt.stopPropagation();} , false);
		}

	}

	todo.saveEdit = function (e) {

		//grab value from the input of the todo being edited
		var newTodo = this.value;
		//check to make sure the input value isn't whitespace, if it is, reset value and exit function
		if (!newTodo.replace(/\s/g, '').length) {
			this.value = '';

			return;
		}

		//allows the edit to be saved when 'Enter' is pressed 
		if (e.keyCode == 13) this.parentNode.innerHTML = newTodo;

		//sets the editing variable back to false so that another todo can be edited
		editing = false;

	}

	todo.saveEditAlt = function (e) {
		e.stopPropagation();

		var newTodo = this.childNodes[1].childNodes[0].value || '';
		
		if (!newTodo.replace(/\s/g, '').length) {
			this.value = '';

			return;
		}

		this.childNodes[1].innerHTML = newTodo;

		editing = false;

	}

	todo.deleteCheckedTodo = function () {
		//gathers all finished todos
		var finishedTodos = document.getElementsByClassName('line-through');

		//if there aren't any, exit th function
		if (finishedTodos.length == 0) return;

		//a loop that deletes all finished todos, and stores them in the todoCache variable
		while (0 < finishedTodos.length) {
			var i = finishedTodos.length;
			todoCache.push(finishedTodos[i-1]);
			finishedTodos[i-1].parentNode.removeChild(finishedTodos[i-1]);
		}

		//makes sure the check all button is unchecked
		document.getElementById("check-all").checked = false;
	}

	todo.checkAllTodo = function () {

		//if there aren't any todos, don't allow the check all button to be checked, and exit function
		if (!document.getElementsByClassName('checkbox').length) {

			document.getElementById("check-all").checked = false;

			return;

		}

		var checkboxes = document.getElementsByClassName('checkbox');

		//if the check all button is checked, loop through all todos and check all of them
		if (document.getElementById("check-all").checked == true) {
			for (i = 0; i < checkboxes.length; i++) {
				checkboxes[i].checked = true;
				checkboxes[i].parentNode.classList.add('line-through');
			}

			console.log('its lit');
		}
		//if the check all button is unchecked, then loop through and uncheck all todos
		else {
			for (i = 0; i < checkboxes.length; i++) {
				checkboxes[i].checked = false;
				checkboxes[i].parentNode.classList.remove('line-through');
			}

			console.log('well, at least it WAS lit, fam.');
		}
	}

	document.getElementById("submit-item").addEventListener("click", todo.newTodo, false);

	document.getElementById("check-all").addEventListener("click", todo.checkAllTodo, false);

	document.getElementById("check-all").checked = false;

	document.getElementById('undo').addEventListener("click", todo.undoDelete, false);

	document.getElementById('delete-finished').addEventListener("click", todo.deleteCheckedTodo, false);

});