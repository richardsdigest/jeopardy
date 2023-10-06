

const headerRow = document.getElementById("header-row");
const gameBoard = document.getElementById("game-board");
const restartButton = document.getElementById("restart-button");

let categories = [];
let questions = [];

categories = ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5", "Category 6"];
    questions = [
        ["?", "?", "?", "?", "?", "?"],
        ["?", "?", "?", "?", "?", "?"],
        ["?", "?", "?", "?", "?", "?"],
        ["?", "?", "?", "?", "?", "?"],
        ["?", "?", "?", "?", "?", "?"],
    ];
async function fetchRandomCategoriesAndQuestions() {
    try {
        const response = await fetch('http://jservice.io/api/random?count=6');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const categoryIds = data.map(item => item.category_id);

        const categoryPromises = categoryIds.map(categoryId =>
            fetch(`http://jservice.io/api/category?id=${categoryId}`)
        );

        const categoryResponses = await Promise.all(categoryPromises);
        const categoryData = await Promise.all(categoryResponses.map(response => response.json()));

        const categories = categoryData.map(category => category.title);
        const questions = categoryData.map(category => category.clues.slice(0, 5).map(clue => clue.question));

        return { categories, questions };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { categories: [], questions: [] };
    }
}


// Function to initialize the game board
function initializeGameBoard() {
    fetchRandomCategoriesAndQuestions();
    headerRow.innerHTML = categories.map(category => `<th>${category}</th>`).join("");
    gameBoard.innerHTML = questions.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");
}

// Function to handle cell clicks
function handleCellClick(row, col) {
    if (questions[row][col] === "?") {
        questions[row][col] = `Question ${row + 1}`;
    } else if (questions[row][col] === `Question ${row + 1}`) {
        questions[row][col] = `Answer ${row + 1}`;
    }
    gameBoard.innerHTML = questions.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");
}

// Event listener for cell clicks
gameBoard.addEventListener("click", (event) => {
    const cell = event.target;
    const col = cell.cellIndex;
    const row = cell.parentElement.rowIndex - 1; 
    if (row >= 0 && col >= 0) {
        handleCellClick(row, col);
    }
});

// Event listener for the restart button
restartButton.addEventListener("click", initializeGameBoard);

// Initialize the game board
initializeGameBoard();
