"use strict";

// ======================================================
// SELECT ELEMENTS
// ======================================================

const totalSaved = document.getElementById("totalSaved");
const totalTarget = document.getElementById("totalTarget");
const averageProgress = document.getElementById("averageProgress");

const progressRing = document.querySelector(".progress-ring");

const goalForm = document.getElementById("goalForm");

const goalNameInput = document.getElementById("goalNameInput");
const targetInput = document.getElementById("targetInput");
const savedInput = document.getElementById("savedInput");
const categoryInput = document.getElementById("categoryInput");
const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");

const featuredGoalName = document.getElementById("featuredGoalName");
const featuredGoalMeta = document.getElementById("featuredGoalMeta");
const featuredProgressBar = document.getElementById("featuredProgressBar");
const featuredSaved = document.getElementById("featuredSaved");
const featuredPercent = document.getElementById("featuredPercent");

const goalsList = document.getElementById("goalsList");

// ======================================================
// GOAL STATE
// ======================================================

let goals = [];

// ======================================================
// STORAGE SYSTEM
// ======================================================

function saveGoals() {
  localStorage.setItem("financeGoals", JSON.stringify(goals));
}

function loadGoals() {
  const storedGoals = localStorage.getItem("financeGoals");

  if (storedGoals) {
    goals = JSON.parse(storedGoals);
  }
}

// ======================================================
// GOAL ACTIONS
// ======================================================

function addGoal() {
  const goal = {
    id: Date.now(),
    name: goalNameInput.value.trim(),
    target: Number(targetInput.value),
    saved: Number(savedInput.value),
    category: categoryInput.value,
  };

  goals.push(goal);

  saveGoals();
  renderGoals();
  renderStats();
  renderFeaturedGoal();

  goalForm.reset();
}

function deleteGoal(id) {
  goals = goals.filter((goal) => {
    return goal.id !== id;
  });

  saveGoals();
  renderGoals();
  renderStats();
  renderFeaturedGoal();
}

function addMoneyToGoal(id) {
  const goal = goals.find((goal) => {
    return goal.id === id;
  });

  if (!goal) return;

  const amount = Number(prompt("How much did you save?"));

  if (isNaN(amount) || amount <= 0) return;

  goal.saved += amount;

  if (goal.saved > goal.target) {
    goal.saved = goal.target;
  }

  saveGoals();
  renderGoals();
  renderStats();
  renderFeaturedGoal();
}

// ======================================================
// FILTERING SYSTEM
// ======================================================

function getFilteredGoals() {
  let filteredGoals = [...goals];

  const searchValue = searchInput.value.toLowerCase().trim();

  if (searchValue !== "") {
    filteredGoals = filteredGoals.filter((goal) => {
      return goal.name.toLowerCase().includes(searchValue);
    });
  }

  const categoryValue = filterInput.value;

  if (categoryValue !== "all") {
    filteredGoals = filteredGoals.filter((goal) => {
      return goal.category === categoryValue;
    });
  }

  return filteredGoals;
}

// ======================================================
// HELPERS
// ======================================================

function getProgress(goal) {
  return Math.min(Math.round((goal.saved / goal.target) * 100), 100);
}

function formatCurrency(amount) {
  return `€${amount}`;
}

// ======================================================
// UI RENDERING
// ======================================================

function renderGoals() {
  goalsList.innerHTML = "";

  const filteredGoals = getFilteredGoals();

  if (filteredGoals.length === 0) {
    goalsList.innerHTML = `
       <div class="empty-goals">
        <h3>No goals found</h3>
        <p>Create your first finance goal or try another search/filter.</p>
      </div>
    `;

    return;
  }

  filteredGoals.forEach((goal) => {
    const progress = getProgress(goal);

    goalsList.innerHTML += `
      <article class="goal-row">
        <div class="goal-main">
          <h4>${goal.name}</h4>
          <span>${goal.category}</span>
        </div>

        <div class="goal-money">
          ${formatCurrency(goal.saved)} / ${formatCurrency(goal.target)}
        </div>

        <div class="goal-mini-progress">
          <div style="width: ${progress}%"></div>
        </div>

        <div class="goal-percent">
          ${progress}%
        </div>

        <div class="goal-actions">
          <button class="add-money" data-id="${goal.id}">
            +
          </button>

          <button class="delete-goal" data-id="${goal.id}">
            ×
          </button>
        </div>
      </article>
    `;
  });
}

function renderStats() {
  const totalSavedAmount = goals.reduce((sum, goal) => {
    return sum + goal.saved;
  }, 0);

  const totalTargetAmount = goals.reduce((sum, goal) => {
    return sum + goal.target;
  }, 0);

  const avg =
    totalTargetAmount === 0
      ? 0
      : Math.round((totalSavedAmount / totalTargetAmount) * 100);

  totalSaved.textContent = formatCurrency(totalSavedAmount);
  totalTarget.textContent = `of ${formatCurrency(totalTargetAmount)} target`;
  averageProgress.textContent = `${avg}%`;

  progressRing.style.background = `
   radial-gradient(circle, #111827 58%, transparent 59%),
   conic-gradient(#10b981 ${avg * 3.6}deg, rgba(255,255,255,0.12) 0deg)`;
}

function renderFeaturedGoal() {
  const featured = goals[0];

  if (!featured) {
    featuredGoalName.textContent = "No goal yet";
    featuredGoalMeta.textContent =
      "Create your first goal to see progress here.";
    featuredProgressBar.style.width = "0%";
    featuredSaved.textContent = "€0 saved";
    featuredPercent.textContent = "0%";
    return;
  }

  const progress = getProgress(featured);

  featuredGoalName.textContent = featured.name;
  featuredGoalMeta.textContent = `${featured.category} goal`;
  featuredProgressBar.style.width = `${progress}%`;
  featuredSaved.textContent = `${formatCurrency(featured.saved)} saved of ${formatCurrency(featured.target)}`;
  featuredPercent.textContent = `${progress}%`;
}

// ======================================================
// FORM HANDLING
// ======================================================

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (
    goalNameInput.value.trim() === "" ||
    targetInput.value.trim() === "" ||
    savedInput.value.trim() === "" ||
    Number(targetInput.value) <= 0 ||
    Number(savedInput.value) < 0
  ) {
    return;
  }

  addGoal();
});

// ======================================================
// EVENT LISTENERS
// ======================================================

searchInput.addEventListener("input", renderGoals);

filterInput.addEventListener("change", renderGoals);

goalsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-goal")) {
    const id = Number(e.target.dataset.id);

    deleteGoal(id);
  }

  if (e.target.classList.contains("add-money")) {
    const id = Number(e.target.dataset.id);

    addMoneyToGoal(id);
  }
});

// ======================================================
// INITIAL LOAD
// ======================================================

loadGoals();
renderGoals();
renderStats();
renderFeaturedGoal();
