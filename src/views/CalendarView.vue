<template>
    <div class="min-h-screen bg-slate-50/50">
      <NavBar />
      
      <div class="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <i class="fas fa-calendar-alt text-indigo-600"></i> Doctor's Schedule
            </h2>
            <p class="text-slate-500 text-sm mt-0.5">
              {{ selectedDate ? formatDateLong(selectedDate) : 'Select a day' }} — 
              {{ selectedDate ? dayAppointments.length : appointments.length }} appointment(s)
            </p>
          </div>
          <button @click="showAddModal = true" class="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-sm flex items-center gap-2">
            <i class="fas fa-plus-circle"></i> New Appointment
          </button>
        </div>
  
        <!-- Calendar Month Grid -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="p-2 rounded-lg hover:bg-slate-100"><i class="fas fa-chevron-left"></i></button>
            <h3 class="text-lg font-bold text-slate-800">{{ currentMonthName }} {{ currentYear }}</h3>
            <button @click="nextMonth" class="p-2 rounded-lg hover:bg-slate-100"><i class="fas fa-chevron-right"></i></button>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-slate-500 mb-2">
            <div v-for="day in dayNames" :key="day">{{ day }}</div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="(day, idx) in calendarDays"
              :key="idx"
              @click="day.isCurrentMonth && selectDate(day.date)"
              class="aspect-square p-1 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center relative group"
              :class="[
                day.isToday ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-slate-300',
                isSelected(day.date) ? 'ring-2 ring-indigo-600 bg-indigo-100' : '',
                !day.isCurrentMonth ? 'text-slate-300 pointer-events-none' : 'text-slate-700'
              ]"
            >
              <span class="text-xs font-bold">{{ day.label }}</span>
              <div v-if="day.colors.length" class="flex gap-0.5 mt-1">
                <span v-for="(color, ci) in day.colors.slice(0,3)" :key="ci"
                      class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: color }"></span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Day Agenda (Timeline) -->
        <div v-if="selectedDate" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg text-slate-800">Agenda for {{ formatDateLong(selectedDate) }}</h3>
            <button @click="selectedDate = null" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
          </div>
          <div class="space-y-1">
            <div v-for="slot in timeSlots" :key="slot.time" class="flex items-center min-h-[36px] group">
              <span class="w-16 text-xs text-slate-400 font-mono shrink-0">{{ slot.time }}</span>
              <div class="flex-1 relative ml-2">
                <div v-for="appt in slot.appointments" :key="appt.id"
                     class="rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer shadow-sm mb-1 flex items-center justify-between"
                     :style="{ backgroundColor: getAppointmentColor(appt.procedure) }"
                     @click="selectedAppointment = appt"
                >
                  <span class="truncate">{{ appt.patientName }}</span>
                  <span class="hidden sm:inline opacity-70 ml-1 text-[10px]">{{ appt.procedure }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Appointment Detail Popup -->
        <Teleport to="body">
          <div v-if="selectedAppointment" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="selectedAppointment = null">
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 class="font-bold text-lg mb-2">{{ selectedAppointment.patientName }}</h3>
              <p class="text-sm text-slate-500">{{ selectedAppointment.patientEmail }}</p>
              <div class="mt-3 space-y-2 text-sm">
                <p><span class="font-medium">Procedure:</span> {{ selectedAppointment.procedure }}</p>
                <p><span class="font-medium">Time:</span> {{ selectedAppointment.startTime }} – {{ selectedAppointment.endTime }}</p>
                <p><span class="font-medium">Status:</span> {{ selectedAppointment.status }}</p>
              </div>
              <div class="flex justify-end gap-2 mt-4">
                <button @click="deleteAppt(selectedAppointment.id); selectedAppointment = null" class="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium">Delete</button>
                <button @click="selectedAppointment = null" class="bg-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium">Close</button>
              </div>
            </div>
          </div>
        </Teleport>
  
        <!-- Add Appointment Modal -->
        <AppointmentModal v-if="showAddModal" @close="showAddModal = false" @saved="showAddModal = false" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import NavBar from '../components/NavBar.vue'
  import AppointmentModal from '../components/AppointmentModal.vue'
  import { useAppointments } from '../composables/useAppointments'
  
  const { appointments, addAppointment, deleteAppointment } = useAppointments()
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const currentMonth = ref(new Date())
  const selectedDate = ref(null)
  const showAddModal = ref(false)
  const selectedAppointment = ref(null)
  
  // Helper to format date as YYYY-MM-DD
  function toDateString(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  
  // Generate calendar days for the current month
  const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth() // 0-indexed
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay() // 0=Sun
  
    const days = []
    // Previous month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ label: '', date: null, isCurrentMonth: false, isToday: false, colors: [] })
    }
    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = toDateString(date)
      const dayAppts = appointments.value.filter(a => a.date === dateStr)
      const colors = dayAppts.map(a => getAppointmentColor(a.procedure))
      days.push({
        label: d,
        date: dateStr,
        isCurrentMonth: true,
        isToday: toDateString(new Date()) === dateStr,
        colors
      })
    }
    return days
  })
  
  const currentMonthName = computed(() => currentMonth.value.toLocaleString('default', { month: 'long' }))
  const currentYear = computed(() => currentMonth.value.getFullYear())
  
  const dayAppointments = computed(() => {
    if (!selectedDate.value) return []
    return appointments.value.filter(a => a.date === selectedDate.value)
  })
  
  // Generate time slots from 07:00 to 19:00 (each slot contains overlapping appointments)
  const timeSlots = computed(() => {
    if (!selectedDate.value) return []
    const dayAppts = dayAppointments.value
    const slots = []
    for (let hour = 7; hour <= 19; hour++) {
      const time = `${String(hour).padStart(2, '0')}:00`
      const overlapping = dayAppts.filter(a => {
        if (!a.startTime || !a.endTime) return false
        const [startH, startM] = a.startTime.split(':').map(Number)
        const [endH, endM] = a.endTime.split(':').map(Number)
        const apptStart = startH * 60 + startM
        const apptEnd = endH * 60 + endM
        const slotTime = hour * 60
        return apptStart <= slotTime && apptEnd > slotTime
      })
      slots.push({ time, appointments: overlapping })
    }
    return slots
  })
  
  const selectDate = (dateStr) => { selectedDate.value = dateStr }
  const isSelected = (dateStr) => dateStr && dateStr === selectedDate.value
  
  const prevMonth = () => {
    const d = new Date(currentMonth.value)
    d.setMonth(d.getMonth() - 1)
    currentMonth.value = d
  }
  const nextMonth = () => {
    const d = new Date(currentMonth.value)
    d.setMonth(d.getMonth() + 1)
    currentMonth.value = d
  }
  
  const formatDateLong = (dateStr) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m-1, d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  
  const getAppointmentColor = (procedure) => {
    if (!procedure) return '#94a3b8'
    const p = procedure.toLowerCase()
    if (p.includes('review') || p.includes('follow')) return '#f87171'
    if (p.includes('botox') || p.includes('filler') || p.includes('inject')) return '#34d399'
    if (p.includes('consult')) return '#fbbf24'
    return '#818cf8' // major surgery
  }
  
  const deleteAppt = async (id) => {
    try {
      await deleteAppointment(id)
    } catch (e) {
      console.error(e)
    }
  }
  </script>