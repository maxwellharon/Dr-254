<template>
  <div class="min-h-screen bg-slate-50/50">
    <NavBar />
    
    <div class="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <!-- Top Welcome Banner Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Clinical Dashboard</h1>
          <p class="text-slate-500 text-sm mt-1">Real-time synchronized visualization engine for Dr. 254's Plastic Surgery Hub.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Wix Cloud Sync Active
          </span>
        </div>
      </div>

      <!-- Loading State Overlay -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
        <p class="text-sm font-medium text-slate-500">Parsing relational clinical tables...</p>
      </div>

      <!-- Main Workspace Panel -->
      <div v-else class="space-y-8">
        
        <!-- Summary Matrices -->
        <StatsCards 
          :total="totalPatients" 
          :mostRequested="mostRequestedProc" 
          :avgAge="averageAge" 
          :nonSurgPercent="nonSurgicalPercent" 
        />

        <!-- Deep Analytical Row: Top 5 Procedures Feature + Patient Insights Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Top 5 Most Requested Procedures Block -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <i class="fas fa-crown text-amber-500"></i> Top 5 Requested Procedures
                </h3>
                <span class="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-1 rounded-md">By Lead Count</span>
              </div>
              <div class="space-y-3.5">
                <div v-for="(proc, idx) in topProcedures" :key="proc.name" class="group flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                  <div class="flex items-center gap-3 min-w-0">
                    <span :class="[
                      'h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                      idx === 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      idx === 1 ? 'bg-slate-200 text-slate-700' :
                      idx === 2 ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-slate-100 text-slate-600'
                    ]">
                      #{{ idx + 1 }}
                    </span>
                    <p class="text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{{ proc.name }}</p>
                  </div>
                  <div class="text-right shrink-0 pl-2">
                    <!-- <p class="text-sm font-bold text-slate-900">{{ proc.count }} leads</p>
                    <p class="text-[11px] text-slate-400 font-medium">KES {{ formatPriceValue(proc.value) }}</p> -->
                  </div>
                </div>
              </div>
            </div>
            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <!-- <span>Total Pipeline Value Assessed:</span>
              <span class="text-slate-900 font-bold text-sm">KES {{ formatPriceValue(totalPipelineValue) }}</span> -->
            </div>
          </div>

          <!-- Clinical Vital Metrics Distribution Profile -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                <i class="fas fa-heartbeat text-rose-500"></i> Clinical Vital Thresholds
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <p class="text-xs font-medium text-indigo-600 uppercase tracking-wider">Average Weight</p>
                <p class="text-2xl font-bold text-indigo-900 mt-1">{{ avgWeight }} <span class="text-sm font-normal">kg</span></p>
              </div>
              <div class="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <p class="text-xs font-medium text-purple-600 uppercase tracking-wider">Average Height</p>
                <p class="text-2xl font-bold text-purple-900 mt-1">{{ avgHeight }} <span class="text-sm font-normal">cm</span></p>
              </div>
              <div class="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <p class="text-xs font-medium text-emerald-600 uppercase tracking-wider">Mean Body Mass Index (BMI)</p>
                <p class="text-2xl font-bold text-emerald-900 mt-1">{{ avgBmi }}</p>
              </div>
              <div class="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <p class="text-xs font-medium text-amber-600 uppercase tracking-wider">Prior Surgeries Noted</p>
                <p class="text-2xl font-bold text-amber-900 mt-1">{{ surgicalHistoryCount }} <span class="text-sm font-normal">cases</span></p>
              </div>
            </div>
            <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
              <i class="fas fa-info-circle text-indigo-500 mr-1.5"></i>
              <strong>Anesthetic Risk Profile Warning:</strong> {{ bmisOver30 }} out of {{ totalPatients }} active prospective cases present clinical BMI calculations above 30.0.
            </div>
          </div>

          <!-- Chronological Pipeline Velocity Chart Panel -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 class="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
              <i class="fas fa-history text-indigo-500"></i> Submission Time Series
            </h3>
            <div class="flex-1 flex items-center justify-center">
              <RegistrationsChart :data="registrationsTimeSeries" />
            </div>
          </div>

        </div>

        <!-- Demographics and Flow Analysis Graphs Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 class="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-400">Age Bracket Distribution</h4>
            <AgeChart :data="ageDistribution" />
          </div>
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 class="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-400">Procedure Breakdown Matrices</h4>
            <ProcedureChart :data="procedureData" />
          </div>
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 class="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-400">Geographic Origins Landscape</h4>
            <CountryChart :data="countryDistribution" />
          </div>
        </div>

        <!-- Lower Split Interface Data Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Primary Patient Queue Data Grid -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-xl text-slate-900 tracking-tight flex items-center gap-2">
                <i class="fas fa-stream text-indigo-600"></i> Quote Submissions Data Stream ({{ totalPatients }})
              </h3>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 overflow-hidden">
              <ResponsiveTable 
                :headers="['Name', 'Procedure', 'Age', 'Country', 'Price (KES)']" 
                :data="recentPatients" 
                :actions="true" 
                @view="goToPatient" 
              />
            </div>
          </div>

          <!-- General Communications Inbox Stream (contact12) -->
          <div class="space-y-4">
            <h3 class="font-bold text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <i class="fas fa-envelope-open-text text-purple-600"></i> Live Messages Inbox ({{ totalInquiries }})
            </h3>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 max-h-[465px] overflow-y-auto custom-scrollbar">
              <div v-if="recentInquiries.length === 0" class="p-8 text-center text-slate-400 text-sm">
                <i class="fas fa-inbox text-2xl block mb-2 text-slate-300"></i> No new general inbox queries logged.
              </div>
              <div v-for="inquiry in recentInquiries" :key="inquiry.id" class="p-4 hover:bg-slate-50/80 transition-all">
                <div class="flex justify-between items-start mb-1.5">
                  <span class="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full truncate max-w-[190px]">
                    {{ inquiry.email }}
                  </span>
                  <span class="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {{ formatDate(inquiry.createdDate) }}
                  </span>
                </div>
                <h4 class="font-bold text-sm text-slate-800 truncate">{{ inquiry.subject }}</h4>
                <p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{{ inquiry.message }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFirestoreData } from '../composables/useFirestoreData'
import NavBar from '../components/NavBar.vue'
import StatsCards from '../components/StatsCards.vue'
import AgeChart from '../components/AgeChart.vue'
import ProcedureChart from '../components/ProcedureChart.vue'
import CountryChart from '../components/CountryChart.vue'
import RegistrationsChart from '../components/RegistrationsChart.vue'
import ResponsiveTable from '../components/ResponsiveTable.vue'

const router = useRouter()
const { patients, inquiries, loading } = useFirestoreData()

const patientList = computed(() => patients.value || [])
const totalPatients = computed(() => patientList.value.length)

const inquiryList = computed(() => inquiries.value || [])
const totalInquiries = computed(() => inquiryList.value.length)

// Clinical Metric Averages (Defensively Structured against Null values and Data Contamination)
const avgWeight = computed(() => {
  const items = patientList.value
    .map(p => Number(p?.weight || 0))
    .filter(w => w > 0 && w < 500)
  return items.length ? Math.round(items.reduce((a, b) => a + b, 0) / items.length) : 0
})

const avgHeight = computed(() => {
  const items = patientList.value
    .map(p => Number(p?.height || 0))
    .filter(h => h > 0 && h < 300)
  return items.length ? Math.round(items.reduce((a, b) => a + b, 0) / items.length) : 0
})

/**
 * RECTIFIED: Bulletproof Mean BMI Pipeline Engine
 * Solves the 4257.4 aggregation leak by explicitly wrapping inputs inside Number constructors
 * to block string concatenations, combined with strict physical limits validation.
 */
const avgBmi = computed(() => {
  const items = patientList.value
    .map(p => Number(p?.bmi || 0))
    // Strict Clinical Range Cap: Completely ignores non-sensical inputs or value leaks
    .filter(bmi => bmi >= 10.0 && bmi <= 90.0) 
    
  return items.length 
    ? (items.reduce((sum, value) => sum + value, 0) / items.length).toFixed(1) 
    : '0.0'
})

const bmisOver30 = computed(() => {
  return patientList.value.filter(p => Number(p?.bmi || 0) >= 30 && Number(p?.bmi || 0) <= 90).length
})

const surgicalHistoryCount = computed(() => {
  return patientList.value.filter(p => {
    if (!p) return false
    const val = String(p.pastSurgeries || '').toLowerCase().trim()
    return val.includes('yes') || (val.length > 0 && !val.includes('no'))
  }).length
})

// Top 5 Most Requested Procedures Feature Calculations
const topProcedures = computed(() => {
  const metrics = {}
  patientList.value.forEach(p => {
    if (!p) return
    const proc = p.selectedProcedure || 'General Consultation'
    if (!metrics[proc]) {
      metrics[proc] = { count: 0, value: 0 }
    }
    metrics[proc].count++
    metrics[proc].value += Number(p.calculatedPrice || 0)
  })
  return Object.entries(metrics)
    .map(([name, obj]) => ({ name, count: obj.count, value: obj.value }))
    .sort((a, b) => b.count !== a.count ? b.count - a.count : b.value - a.value)
    .slice(0, 5)
})

const totalPipelineValue = computed(() => {
  return patientList.value.reduce((acc, p) => acc + Number(p?.calculatedPrice || 0), 0)
})

const mostRequestedProc = computed(() => {
  return topProcedures.value[0]?.name || '—'
})

const averageAge = computed(() => {
  const ages = patientList.value.map(p => Number(p?.age || 0)).filter(age => age > 0 && age < 120)
  return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0
})

const nonSurgicalPercent = computed(() => {
  if (!totalPatients.value) return 0
  const nonSurg = patientList.value.filter(p => p?.isNonSurgical).length
  return Math.round((nonSurg / totalPatients.value) * 100)
})

const ageDistribution = computed(() => {
  const groups = [0, 0, 0, 0]
  patientList.value.forEach(p => {
    if (!p) return
    const age = Number(p.age)
    if (age >= 18 && age <= 25) groups[0]++
    else if (age >= 26 && age <= 35) groups[1]++
    else if (age >= 36 && age <= 50) groups[2]++
    else if (age > 50) groups[3]++
  })
  return groups
})

const procedureData = computed(() => {
  const counts = {}
  patientList.value.forEach(p => {
    if (!p) return
    const proc = p.selectedProcedure || 'General Consultation'
    counts[proc] = (counts[proc] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return { labels: sorted.map(e => e[0]), counts: sorted.map(e => e[1]) }
})

const countryDistribution = computed(() => {
  const counts = {}
  patientList.value.forEach(p => {
    if (!p) return
    const c = p.Country || 'Kenya'
    counts[c] = (counts[c] || 0) + 1
  })
  return { labels: Object.keys(counts), values: Object.values(counts) }
})

const registrationsTimeSeries = computed(() => {
  const months = {}
  patientList.value.forEach(p => {
    if (p && p.createdDate) {
      const d = new Date(p.createdDate)
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        months[key] = (months[key] || 0) + 1
      }
    }
  })
  const sortedKeys = Object.keys(months).sort()
  return { labels: sortedKeys, counts: sortedKeys.map(k => months[k]) }
})

const recentPatients = computed(() => {
  const base = [...patientList.value]
  return base.slice(0, 10)
})

const recentInquiries = computed(() => {
  const base = [...inquiryList.value]
  return base.slice(0, 15)
})

const goToPatient = (p) => {
  if (p && p.id) {
    router.push(`/patients/${p.id}`)
  }
}

function formatPriceValue(val) {
  if (!val) return '0'
  const numericVal = Number(val)
  return numericVal >= 1000000 
    ? (numericVal / 1000000).toFixed(2) + 'M' 
    : (numericVal / 1000).toFixed(0) + 'K'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}
</script>
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>