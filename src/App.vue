<script setup lang="ts">
import { computed } from 'vue'
import { useGame, Color } from "./composables/game.ts";

const { board, update, turn, winner } = useGame();
const winnerMsg = computed<string>(() => {
	switch (winner.value) {
		case "player":
			return "Congratulations You Won!"
		case "ai":
			return "I can't believe you were beaten by a piece of metal."
		case "tie":
			return "Well, at least it's a Tie."
		default:
			return ""
	}
})

function onCellClicked(i, j) {
	if (!turn.value || winner.value) return;
	update(i, j, Color.Player);
}
</script>

<template>
	<h1>Connect Four</h1>
	<div class="board">
		<div class="row" v-for="(row, rowIndex) of board">
			<div class="cell" :style="{
				backgroundColor:
					cell.color != Color.Empty
						? cell.color
						: cell.allowed
							? Color.Empty
							: 'gray',
			}" v-for="(cell, cellIndex) of row" @click="onCellClicked(rowIndex, cellIndex)"></div>
		</div>
	</div>
	<div v-if="winner">
		{{ winnerMsg }}
	</div>
	<div v-else>
		{{ "It's " + (turn ? "Your" : "AI") + " turn now." }}
	</div>
</template>

<style scoped>
.board {
	background-color: #3232cb;
	padding-top: 1rem;
	padding-bottom: 1rem;

}

.row {
	display: flex;
	justify-items: center;
	justify-content: center;
	margin: auto;
}

.cell {
	margin: 0.5rem;
	width: 2rem;
	height: 2rem;
	background-color: white;
	border-radius: 2rem;
}
</style>
