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

			console.log(count);
		}
	}

	var todoCache = [];

	todo.deleteTodo = function () {
		todoCache.push(this.parentNode);

		this.parentNode.parentNode.removeChild(this.parentNode); 

		return todoCache;
	}

	todo.undoDelete = function (evt) {
		evt.preventDefault();

		if (todoCache.length > 0 ) {
			var lastTodo = todoCache.length - 1;

			ul.appendChild(todoCache[lastTodo]);

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

		if (editing == true) {
			return;
		}

		else {
			var todoVal = this.innerHTML;
			var input = document.createElement('input');

			editing = true;

			input.value = todoVal;
			this.innerHTML = '';
			this.appendChild(input);

			input.addEventListener("keydown", todo.saveEdit, false);

			input.parentNode.parentNode.addEventListener("click", todo.saveEditAlt, false);

			input.addEventListener("click", function (evt) { evt.stopPropagation();} , false);
		}

	}

	todo.saveEdit = function (e) {

		var newTodo = this.value;
		if (!newTodo.replace(/\s/g, '').length) {
			this.value = '';

			return;
		}

		if (e.keyCode == 13) this.parentNode.innerHTML = newTodo;

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
		var finishedTodos = document.getElementsByClassName('line-through');

		if (finishedTodos.length == 0) return;

		while (0 < finishedTodos.length) {
			var i = finishedTodos.length;
			todoCache.push(finishedTodos[i-1]);
			finishedTodos[i-1].parentNode.removeChild(finishedTodos[i-1]);
		}

		document.getElementById("check-all").checked = false;
	}

	todo.checkAllTodo = function () {

		if (!document.getElementsByClassName('checkbox').length) {

			document.getElementById("check-all").checked = false;

			return;

		}

		var checkboxes = document.getElementsByClassName('checkbox');

		if (document.getElementById("check-all").checked == true) {
			for (i = 0; i < checkboxes.length; i++) {
				checkboxes[i].checked = true;
				checkboxes[i].parentNode.classList.add('line-through');
			}

			console.log('its lit');
		}
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