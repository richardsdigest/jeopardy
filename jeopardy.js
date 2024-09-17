const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

let categories = [];

/** Get NUM_CATEGORIES random categories from the API.
 *
 * Returns array of category ids.
 */
async function getCategoryIds() {
  const response = await axios.get('https://rithm-jeopardy.herokuapp.com/api/random', {
    params: { count: NUM_CATEGORIES }
  });
  return response.data.categories.map(cat => cat.id);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category`, {
    params: { id: catId }
  });
  let category = response.data;
  
  // Randomly select 5 clues per category
  let clues = _.sampleSize(category.clues, NUM_QUESTIONS_PER_CAT).map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null
  }));
  
  return { title: category.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category.
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>.
 *   (Initially, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  const $thead = $('#jeopardy thead');
  const $tbody = $('#jeopardy tbody');
  $thead.empty();
  $tbody.empty();

  // Add category headers
  let $tr = $('<tr>');
  for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
    $tr.append($('<th>').text(categories[catIdx].title));
  }
  $thead.append($tr);

  // Add rows for questions (initially showing ?)
  for (let clueIdx = 0; clueIdx < NUM_QUESTIONS_PER_CAT; clueIdx++) {
    let $tr = $('<tr>');
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append($('<td>')
        .attr('id', `${catIdx}-${clueIdx}`)
        .text('?')
        .on('click', handleClick));
    }
    $tbody.append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 */
function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split('-');
  let clue = categories[catId].clues[clueId];

  if (!clue.showing) {
    // If clue not showing anything, show the question
    clue.showing = 'question';
    $(`#${catId}-${clueId}`).text(clue.question);
  } else if (clue.showing === 'question') {
    // If showing the question, show the answer
    clue.showing = 'answer';
    $(`#${catId}-${clueId}`).text(clue.answer);
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  $('#jeopardy thead').empty();
  $('#jeopardy tbody').empty();
  $('#loading').show();
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  $('#loading').hide();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 */
async function setupAndStart() {
  showLoadingView();

  let categoryIds = await getCategoryIds();
  categories = [];

  for (let catId of categoryIds) {
    categories.push(await getCategory(catId));
  }

  hideLoadingView();
  fillTable();
}

/** On click of start / restart button, set up game. */
$('#restart').on('click', setupAndStart);

/** On page load, add event handler for clicking clues */
$(async function () {
  setupAndStart();
});
