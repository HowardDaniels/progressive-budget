const actionBtn = document.getElementById("action-button");
// new item
const makeTransaction = document.getElementById("make-new");
// clear all items
const clear = document.getElementById("clear-all");
// delete an item
const results = document.getElementById("results");

const status = document.getElementById("status");

function getResults() {
  clearTodos();
  fetch("/all")
    .then(function(response) {
      if (response.status !== 200) {
        console.log("Looks like there was a problem. Status Code: " + response.status);
        return;
      }
      response.json().then(function(data) {
        newTodoSnippet(data);
      });
    })
    .catch(function(err) {
      console.log("Fetch Error :-S", err);
    });
}

function newTodoSnippet(res) {
  console.log(res);
  var total = 0;
  console.log(res.length);
  for (var i = 0; i < res.length; i++) {
    const data_id = res[i]["_id"];
    const name = res[i]["name"];
    const type = res[i]["type"];
    const amount = res[i]["amount"];
    const balance = document.getElementById("balance");

    if (type === "deposit"){
      total += parseFloat(amount);
    }

    else if (type === "expense"){
      total -= parseFloat(amount);
    }
    console.log(total);

    const todoList = document.getElementById("results");

    if (type === "deposit"){
      snippet = `
      <p class="data-entry">
      <span class="dataTitle" data-id=${data_id}>${name}: </span>
      <span class="dataAmount" data-id=${data_id} style="color: green;">+$${amount}</span>
      <span onClick="delete" class="delete" data-id=${data_id}>x</span>;
      </p>`;
    }

    else if (type === "expense"){
    snippet = `
      <p class="data-entry">
      <span class="dataTitle" data-id=${data_id}>${name}: </span>
      <span class="dataAmount" data-id=${data_id} style="color: red;">-$${amount}</span>
      <span onClick="delete" class="delete" data-id=${data_id}>x</span>;
      </p>`;
    }
    balance.textContent = `Balance: $${total} `;
    todoList.insertAdjacentHTML("beforeend", snippet);
  }
}

function clearTodos() {
  const todoList = document.getElementById("results");
  todoList.innerHTML = "";
}

function resetNameandAmount() {
  const amount = document.getElementById("amount");
  amount.value = "";
  const name = document.getElementById("name");
  name.value = "";
}

function updateNameAndAmount(data) {
  const amount = document.getElementById("amount");
  amount.value = data.amount;
  const name = document.getElementById("name");
  name.value = data.name;
}

getResults();

clear.addEventListener("click", function(e) {
  if (e.target.matches("#clear-all")) {
    element = e.target;
    data_id = element.getAttribute("data-id");
    fetch("/clearall", {
      method: "delete"
    })
      .then(function(response) {
        if (response.status !== 200) {
          console.log("Looks like there was a problem. Status Code: " + response.status);
          return;
        }
        clearTodos();
      })
      .catch(function(err) {
        console.log("Fetch Error :-S", err);
      });
  }
});

results.addEventListener("click", function(e) {
  if (e.target.matches(".delete")) {
    element = e.target;
    data_id = element.getAttribute("data-id");
    fetch("/delete/" + data_id, {
      method: "delete"
    })
      .then(function(response) {
        if (response.status !== 200) {
          console.log("Looks like there was a problem. Status Code: " + response.status);
          return;
        }
        element.parentNode.remove();
        resetNameandAmount();
        const newButton = `
      <button id='make-new'>Submit</button>`;
        actionBtn.innerHTML = newButton;
      })
      .catch(function(err) {
        console.log("Fetch Error :-S", err);
      });
  } else if (e.target.matches(".dataTitle")) {
    element = e.target;
    data_id = element.getAttribute("data-id");
    status.innerText = "Editing";
    fetch("/find/" + data_id, { method: "get" })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        updateNameAndAmount(data);
        const newButton = `<button id='updater' data-id=${data_id}>Update</button>`;
        actionBtn.innerHTML = newButton;
      })
      .catch(function(err) {
        console.log("Fetch Error :-S", err);
      });
  }
});

actionBtn.addEventListener("click", function(e) {
  if (e.target.matches("#updater")) {
    console.log("A");
    updateBtnEl = e.target;
    data_id = updateBtnEl.getAttribute("data-id");
    const name = document.getElementById("name").value;
    const type = document.getElementById("type").value;
    const amount = document.getElementById("amount").value;
    fetch("/update/" + data_id, {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        type,
        amount
      })
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        element.innerText = title;
        resetNameandAmount();
        const newButton = "<button id='make-new'>Submit</button>";
        actionBtn.innerHTML = newButton;
        status.innerText = "Creating";
      })
      .catch(function(err) {
        console.log("Fetch Error :-S", err);
      });
  } else if (e.target.matches("#make-new")) {
    console.log("B");
    element = e.target;
    data_id = element.getAttribute("data-id");
    fetch("/submit", {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: document.getElementById("name").value,
        type: document.getElementById("type").value,
        amount: document.getElementById("amount").value,
        created: Date.now()
      })
    })
      .then(res => res.json())
      .then(res => newTodoSnippet([res]));
    resetNameandAmount();
  }
});
