document.addEventListener("DOMContentLoaded", function () {
	var todo = Object.create(null);
	var ul = document.getElementById("todo-view");
	var input = document.getElementById("todo-item");

	todo.newTodo = function (evt) {
		evt.preventDefault();
		var newTodo = input.value;
		var li = document.createElement("li");
		li.innerHTML = '<input type="checkbox">' + newTodo + '<i class="material-icons">close</i>';

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
		}
	}

	var todoCache = [];

	todo.deleteTodo = function () {
		todoCache.push(this.parentNode);

		this.parentNode.parentNode.removeChild(this.parentNode); 

		return todoCache;
	}

	todo.undoDelete = function () {

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

	var todoSub = document.getElementById("submit-item");

	todoSub.addEventListener("click", todo.newTodo, false);

	var undo = document.getElementById('undo'); 

	undo.addEventListener("click", todo.undoDelete, false);
});