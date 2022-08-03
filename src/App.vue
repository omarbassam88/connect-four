<script setup lang="ts">
import { useGame, Color } from "./composables/game.ts";

const { board, update } = useGame();
function onCellClicked(i, j) {
  update(i, j, Color.Player);
}
</script>

<template>
  <h1>Connect Four</h1>
  <div>
    <div class="row" v-for="(row, rowIndex) of board">
      <div
        class="cell"
        :style="{
          backgroundColor:
            cell.color != Color.Empty
              ? cell.color
              : cell.allowed
              ? Color.Empty
              : 'gray',
        }"
        v-for="(cell, cellIndex) of row"
        @click="onCellClicked(rowIndex, cellIndex)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
}

.cell {
  margin: 0.5rem;
  width: 2rem;
  height: 2rem;
  background-color: white;
  border-radius: 2rem;
}
</style>
