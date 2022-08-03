import { ref, watch } from "vue";

export enum Color {
  Player = "red",
  AI = "blue",
  Empty = "white",
}

export interface Cell {
  allowed: boolean;
  color: Color;
}

const numRows: number = 7;
const numCols: number = 12;
const emptyBoard: Cell[][] = new Array(numRows)
  .fill(0)
  .map((_, row) =>
    new Array(numCols)
      .fill(0)
      .map((_) => ({ color: Color.Empty, allowed: row === numRows - 1 }))
  );
const board = ref(emptyBoard);
const turn = ref(true);

function update(row: number, col: number, color: Color) {
  if (!board.value[row][col].allowed) return;
  board.value[row][col].color = color;
  board.value[row][col].allowed = false;
  if (row >= 1) board.value[row - 1][col].allowed = true;
  turn.value = !turn.value;
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
    if (i < numRows && j < numCols && board.value[i++][j++].color == color)
      count++;
    if (i < numRows && j < numCols && board.value[i++][j++].color == color)
      count++;
    if (i < numRows && j < numCols && board.value[i++][j++].color == color)
      count++;
    if (i < numRows && j < numCols && board.value[i++][j++].color == color)
      count++;
    return points[count];
  };

  const rightDiagonalScore = (i: number, j: number) => {
    let count = 0;
    if (i < numRows && j < numCols && board.value[i++][j--].color == color)
      count++;
    if (i < numRows && j < numCols && board.value[i++][j--].color == color)
      count++;
    if (i < numRows && j < numCols && board.value[i++][j--].color == color)
      count++;
    if (i < numRows && j < numCols && board.value[i++][j--].color == color)
      count++;
    return points[count];
  };
  let total = 0;
  const points = [0, 1, 2, 25, 100];

  for (let i = 0; i < numRows; ++i) {
    for (let j = 0; j < numCols; j++) {
      if (board.value[i][j] == color) {
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
  if (depth <= 1) return score(Color.AI) - score(Color.Player);
  if (maximize) {
    let maxVal: number = -Infinity;
    for (let row = numRows - 1; row >= 0; row--) {
      for (let col = 0; col < numCols; col++) {
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
    for (let row = numRows - 1; row >= 0; row--) {
      for (let col = 0; col < numCols; col++) {
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
  let i: number;
  let j: number;
  for (let row = numRows - 1; row >= 0; row--) {
    for (let col = 0; col < numCols; col++) {
      if (board.value[row][col].allowed) {
        board.value[row][col] = { color: Color.AI, allowed: false };
        if (row > 0) board.value[row - 1][col].allowed = true;

        let val = minimax(3, false);

        board.value[row][col] = { color: Color.Empty, allowed: true };
        if (row > 0) board.value[row - 1][col].allowed = false;

        if (val > maxVal) {
          maxVal = val;
          i = row;
          j = col;
        }
      }
    }
  }
  update(i, j, Color.AI);
}

watch(turn, () => {
  if (!turn.value) {
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
  };
}
