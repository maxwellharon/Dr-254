<template>
  <div class="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition">
    <h3 class="font-bold text-xl mb-3">Procedure Requests</h3>
    <canvas id="procChart" width="400" height="250" style="max-height: 250px;"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps(['data'])
let chart = null

onMounted(() => {
  const ctx = document.getElementById('procChart').getContext('2d')
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.data.labels || [],
      datasets: [{ label: 'Requests', data: props.data.counts || [], backgroundColor: '#818cf8', borderRadius: 8 }]
    },
    options: { responsive: true, maintainAspectRatio: true }
  })
})

watch(() => props.data, (newData) => {
  if (chart) {
    chart.data.labels = newData.labels || []
    chart.data.datasets[0].data = newData.counts || []
    chart.update()
  }
}, { deep: true })
</script>