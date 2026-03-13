// Clean water solutions used as the 8 matching pair themes.
const solutions = [
	{
		id: "filter",
		icon: "\ud83e\uddfa",
		name: "Water Filter",
		snippet: "Water filters remove harmful particles, making water safer to drink right at home."
	},
	{
		id: "well",
		icon: "\ud83d\udd73\ufe0f",
		name: "Well",
		snippet: "Wells can bring clean groundwater closer to villages and reduce long water walks."
	},
	{
		id: "pump",
		icon: "\u26fd",
		name: "Hand Pump",
		snippet: "Hand pumps make it easier to pull clean water up from underground sources."
	},
	{
		id: "pipes",
		icon: "\ud83d\udd27",
		name: "Pipes",
		snippet: "Piped systems can deliver reliable clean water to schools, clinics, and homes."
	},
	{
		id: "rain",
		icon: "\ud83c\udf27\ufe0f",
		name: "Rain Collection",
		snippet: "Rainwater collection captures seasonal rain and stores it for daily community use."
	},
	{
		id: "spring",
		icon: "\ud83d\udca7",
		name: "Protected Spring",
		snippet: "Protecting natural springs helps keep source water cleaner and safer year-round."
	},
	{
		id: "tank",
		icon: "\ud83d\udee2\ufe0f",
		name: "Storage Tank",
		snippet: "Water storage tanks keep water available between collection trips and dry periods."
	},
	{
		id: "hygiene",
		icon: "\ud83e\uddfc",
		name: "Handwashing",
		snippet: "Handwashing stations support hygiene and help stop preventable water-related illness."
	}
];

const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const snippetPanel = document.getElementById("snippet-panel");
const playAgainButton = document.getElementById("play-again");
const finalScoreElement = document.getElementById("final-score");
const finalTimeElement = document.getElementById("final-time");

const winModalElement = document.getElementById("winModal");
const winModal = new bootstrap.Modal(winModalElement);

let deck = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let secondsElapsed = 0;
let timerId = null;
let lockBoard = false;

// Create two cards for each solution so every theme has a pair.
function createDeck() {
	const pairs = solutions.flatMap((solution) => {
		return [
			{ ...solution, uniqueId: `${solution.id}-a` },
			{ ...solution, uniqueId: `${solution.id}-b` }
		];
	});

	return shuffleDeck(pairs);
}

// Fisher-Yates shuffle for a fair random order each game.
function shuffleDeck(cards) {
	const shuffled = [...cards];

	for (let i = shuffled.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled;
}

function renderBoard() {
	boardElement.innerHTML = "";

	deck.forEach((cardData) => {
		const cardButton = document.createElement("button");
		cardButton.className = "memory-card";
		cardButton.type = "button";
		cardButton.dataset.id = cardData.id;
		cardButton.dataset.uniqueId = cardData.uniqueId;
		cardButton.setAttribute("aria-label", "Memory card");

		cardButton.innerHTML = `
			<div class="card-inner">
				<div class="card-face card-back">
					<div class="card-icon">\ud83d\udca6</div>
					<div class="card-name">Flip</div>
				</div>
				<div class="card-face card-front">
					<div class="card-icon">${cardData.icon}</div>
					<div class="card-name">${cardData.name}</div>
				</div>
			</div>
		`;

		cardButton.addEventListener("click", handleCardClick);
		boardElement.appendChild(cardButton);
	});
}

function handleCardClick(event) {
	const clickedCard = event.currentTarget;

	// Stop invalid clicks while checking cards or when card is already handled.
	if (lockBoard) {
		return;
	}

	if (clickedCard.classList.contains("matched")) {
		return;
	}

	if (flippedCards.includes(clickedCard)) {
		return;
	}

	flipCard(clickedCard);
	flippedCards.push(clickedCard);

	if (flippedCards.length === 2) {
		checkForMatch();
	}
}

function flipCard(cardElement) {
	cardElement.classList.add("flipped");
}

function unflipCard(cardElement) {
	cardElement.classList.remove("flipped");
}

function checkForMatch() {
	lockBoard = true;

	const [firstCard, secondCard] = flippedCards;
	const isMatch = firstCard.dataset.id === secondCard.dataset.id;

	if (isMatch) {
		handleMatch(firstCard, secondCard);
		return;
	}

	handleMismatch(firstCard, secondCard);
}

function handleMatch(firstCard, secondCard) {
	firstCard.classList.add("matched");
	secondCard.classList.add("matched");

	firstCard.disabled = true;
	secondCard.disabled = true;

	matchedPairs += 1;
	score += 10;

	updateScore();
	showSnippet(firstCard.dataset.id);
	resetTurn();
	checkWin();
}

function handleMismatch(firstCard, secondCard) {
	setTimeout(() => {
		unflipCard(firstCard);
		unflipCard(secondCard);
		resetTurn();
	}, 850);
}

function resetTurn() {
	flippedCards = [];
	lockBoard = false;
}

function showSnippet(solutionId) {
	const found = solutions.find((solution) => solution.id === solutionId);

	if (!found) {
		return;
	}

	snippetPanel.textContent = found.snippet;

	// Re-trigger panel flash animation on every new match.
	snippetPanel.classList.remove("snippet-flash");
	void snippetPanel.offsetWidth;
	snippetPanel.classList.add("snippet-flash");
}

function updateScore() {
	scoreElement.textContent = String(score);
	scoreElement.classList.remove("score-pop");
	void scoreElement.offsetWidth;
	scoreElement.classList.add("score-pop");
}

function formatTime(totalSeconds) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
	stopTimer();
	timerId = setInterval(() => {
		secondsElapsed += 1;
		timerElement.textContent = formatTime(secondsElapsed);
	}, 1000);
}

function stopTimer() {
	if (timerId) {
		clearInterval(timerId);
		timerId = null;
	}
}

function checkWin() {
	if (matchedPairs !== solutions.length) {
		return;
	}

	stopTimer();
	finalScoreElement.textContent = String(score);
	finalTimeElement.textContent = formatTime(secondsElapsed);
	winModal.show();
}

function resetGame() {
	stopTimer();
	deck = createDeck();
	flippedCards = [];
	matchedPairs = 0;
	score = 0;
	secondsElapsed = 0;
	lockBoard = false;

	scoreElement.textContent = "0";
	timerElement.textContent = "00:00";
	snippetPanel.textContent = "Match a pair to reveal a clean water solution fact.";

	renderBoard();
	startTimer();
}

playAgainButton.addEventListener("click", () => {
	winModal.hide();
	resetGame();
});

// Start the first game when the page loads.
resetGame();
