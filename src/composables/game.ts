import { ref, watch } from "vue";
import type { Ref } from 'vue'

export enum Color {
	Player = "red",
	AI = "yellow",
	Empty = "white",
}

export interface Cell {
	allowed: boolean;
	color: Color;
}

type Board = Cell[][]
type Winner = "player" | "ai" | "tie" | null;

const numRows: number = 6;
const numCols: number = 7;
const emptyBoard: Board = new Array(numRows)
	.fill(0)
	.map((_, row) =>
		new Array(numCols)
			.fill(0)
			.map((_) => ({ color: Color.Empty, allowed: row === numRows - 1 }))
	);
const board: Ref<Board> = ref<Board>(emptyBoard);
const turn: Ref<boolean> = ref(true);
const winner: Ref<Winner> = ref<Winner>(null)

function update(row: number, col: number, color: Color) {
	if (!board.value[row][col].allowed || winner.value) return;
	board.value[row][col].color = color;
	board.value[row][col].allowed = false;
	if (row >= 1) board.value[row - 1][col].allowed = true;
	winner.value = checkWinner();
	if (!winner.value) turn.value = !turn.value;
}

function checkWinner(): Winner {
	const isLeftFourSame = (i: number, j: number) => {
		if (j < 3) return false
		let x = board.value[i][j].color
		if (board.value[i][j - 1].color != x) return false
		if (board.value[i][j - 2].color != x) return false
		if (board.value[i][j - 3].color != x) return false
		return true
	}
	const isRightFourSame = (i: number, j: number) => {
		if (j > numCols - 4) return false
		let x = board.value[i][j].color
		if (board.value[i][j + 1].color != x) return false
		if (board.value[i][j + 2].color != x) return false
		if (board.value[i][j + 3].color != x) return false
		return true
	}
	const isBottomFourSame = (i: number, j: number) => {
		if (i > numRows - 4) return false
		let x = board.value[i][j].color
		if (board.value[i + 1][j].color != x) return false
		if (board.value[i + 2][j].color != x) return false
		if (board.value[i + 3][j].color != x) return false
		return true
	}
	const isLeftDiagonalFourSame = (i: number, j: number) => {
		if (j > numCols - 4 || i > numRows - 4) return false
		let x = board.value[i][j].color
		if (board.value[i + 1][j + 1].color != x) return false
		if (board.value[i + 2][j + 2].color != x) return false
		if (board.value[i + 3][j + 3].color != x) return false
		return true
	}
	const isRightDiagonalFourSame = (i: number, j: number) => {
		if (j < 3 || i > numRows - 4) return false
		let x = board.value[i][j].color
		if (board.value[i + 1][j - 1].color != x) return false
		if (board.value[i + 2][j - 2].color != x) return false
		if (board.value[i + 3][j - 3].color != x) return false
		return true
	}
	const possibleCases = [isLeftFourSame, isRightFourSame, isBottomFourSame, isLeftDiagonalFourSame, isRightDiagonalFourSame]

	// Check for possible cases to win
	for (let i = 0; i < numRows; i++) {
		for (let j = 0; j < numCols; j++) {
			if (board.value[i][j].color != Color.Empty) {
				for (let k = 0; k < possibleCases.length; k++) {
					if (possibleCases[k](i, j)) {
						return board.value[i][j].color == Color.Player ? "player" : "ai"
					}
				}
			}
		}
	}

	// Check if all cells are filled
	for (let i = 0; i < numRows; i++) {
		for (let j = 0; j < numCols; j++) {
			if (board.value[i][j].allowed) return null
		}
	}

	return "tie"
}

function score(color: Color): number {
	const horizontalScore = (i: number, j: number) => {
		let count = 0;
		if (j < numCols && board.value[i][j++].color == color) count++;
		if (j < numCols && board.value[i][j++].color == color) count++;
		if (j < numCols && board.value[i][j++].color == color) count++;
		if (j < numCols && board.value[i][j++].color == color) count++;
		return points[count];
	};
	const verticalScore = (i: number, j: number) => {
		let count = 0;
		if (i < numRows && board.value[i++][j].color == color) count++;
		if (i < numRows && board.value[i++][j].color == color) count++;
		if (i < numRows && board.value[i++][j].color == color) count++;
		if (i < numRows && board.value[i++][j].color == color) count++;
		return points[count];
	};
	const leftDiagonalScore = (i: number, j: number) => {
		let count = 0;
		if (i < numRows && j < numCols && board.value[i++][j++].color == color) count++;
		if (i < numRows && j < numCols && board.value[i++][j++].color == color) count++;
		if (i < numRows && j < numCols && board.value[i++][j++].color == color) count++;
		if (i < numRows && j < numCols && board.value[i++][j++].color == color) count++;
		return points[count];
	};

	const rightDiagonalScore = (i: number, j: number) => {
		let count = 0;
		if (i < numRows && j < numCols && j > 0 && board.value[i++][j--].color == color)
			count++;
		if (i < numRows && j < numCols && j > 0 && board.value[i++][j--].color == color)
			count++;
		if (i < numRows && j < numCols && j > 0 && board.value[i++][j--].color == color)
			count++;
		if (i < numRows && j < numCols && j > 0 && board.value[i++][j--].color == color)
			count++;
		return points[count];
	};
	let total = 0;
	const points = [0, 1, 2, 25, 100];

	for (let i = 0; i < numRows; ++i) {
		for (let j = 0; j < numCols; j++) {
			if (board.value[i][j].color == color) {
				total += horizontalScore(i, j);
				total += verticalScore(i, j);
				total += leftDiagonalScore(i, j);
				total += rightDiagonalScore(i, j);
				total -= 3;
			}
		}
	}
	return total;
}

function minimax(depth: number, maximize: boolean): number {
	let win = checkWinner();
	if (win == "player") return -200;
	if (win == "ai") return 200;

	if (depth < 0) return score(Color.AI) - score(Color.Player);
	if (maximize) {
		let maxVal: number = -Infinity;
		for (let col = 0; col < numCols; col++) {
			for (let row = numRows - 1; row >= 0; row--) {
				if (board.value[row][col].allowed) {
					board.value[row][col] = { color: Color.AI, allowed: false };
					if (row > 0) board.value[row - 1][col].allowed = true;
					let val: number = minimax(depth - 1, false);
					maxVal = Math.max(maxVal, val);
					board.value[row][col] = { color: Color.Empty, allowed: true };
					if (row > 0) board.value[row - 1][col].allowed = false;
				}
			}
		}
		return maxVal;
	} else {
		let minVal: number = Infinity;
		for (let col = 0; col < numCols; col++) {
			for (let row = numRows - 1; row >= 0; row--) {
				if (board.value[row][col].allowed) {
					board.value[row][col] = { color: Color.Player, allowed: false };
					if (row > 0) board.value[row - 1][col].allowed = true;
					let val: number = minimax(depth - 1, true);
					minVal = Math.min(minVal, val);
					board.value[row][col] = { color: Color.Empty, allowed: true };
					if (row > 0) board.value[row - 1][col].allowed = false;
				}
			}
		}
		return minVal;
	}
}

function playBot() {
	let maxVal = -Infinity;
	let i: number = 0;
	let j: number = 0;
	for (let col = 0; col < numCols; col++) {
		for (let row = numRows - 1; row >= 0; row--) {
			if (board.value[row][col].allowed) {
				// Play cell at row, col
				board.value[row][col] = { color: Color.AI, allowed: false };
				if (row > 0) board.value[row - 1][col].allowed = true;

				let val = minimax(5, true);

				// Undo Last Move
				board.value[row][col] = { color: Color.Empty, allowed: true };
				if (row > 0) board.value[row - 1][col].allowed = false;

				if (val > maxVal) {
					maxVal = val;
					i = row;
					j = col;
				}

				console.log("Max: ", maxVal)
			}
		}
	}
	update(i, j, Color.AI);
}

watch(turn, () => {
	if (!turn.value && !winner.value) {
		setTimeout(() => {
			playBot();
		}, 0);
	}
});

export function useGame() {
	return {
		board,
		update,
		turn,
		winner
	};
}
