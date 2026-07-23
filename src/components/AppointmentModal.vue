<template>
    <Transition name="modal">
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
        <div class="bg-white rounded-2xl p-6 w-full max-w-lg">
          <h3 class="text-xl font-bold mb-4">New Appointment Slot</h3>
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">Patient Name</label>
              <input v-model="form.patientName" required class="w-full border p-2 rounded-xl mt-1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Patient Email</label>
              <input v-model="form.patientEmail" type="email" required class="w-full border p-2 rounded-xl mt-1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Procedure / Service</label>
              <select v-model="form.procedure" required class="w-full border p-2 rounded-xl mt-1">
                <option value="">Select procedure...</option>
                <option v-for="proc in PROCEDURES" :key="proc.name" :value="proc.name">{{ proc.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-slate-700">Date</label>
                <input v-model="form.date" type="date" required class="w-full border p-2 rounded-xl mt-1" />
              </div>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-slate-700">Start</label>
                  <input v-model="form.startTime" type="time" required class="w-full border p-2 rounded-xl mt-1" />
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-slate-700">End</label>
                  <input v-model="form.endTime" type="time" required class="w-full border p-2 rounded-xl mt-1" />
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-5">
              <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded-xl hover:bg-gray-100 transition">Cancel</button>
              <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition">Save Appointment</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  import { useAppointments } from '../../api/useAppointments'
  
  const emit = defineEmits(['close', 'saved'])
  const { addAppointment } = useAppointments()
  
  const PROCEDURES = [
    { name: 'Consultation', color: '#fbbf24' },
    { name: 'Botox / Fillers', color: '#34d399' },
    { name: 'Review / Follow-up', color: '#f87171' },
    { name: 'Liposuction', color: '#818cf8' },
    { name: 'Breast Augmentation', color: '#818cf8' },
    { name: 'Rhinoplasty', color: '#818cf8' },
    { name: 'Tummy Tuck', color: '#818cf8' },
    { name: 'Other Surgical', color: '#818cf8' }
  ]
  
  const form = reactive({
    patientName: '',
    patientEmail: '',
    procedure: '',
    date: '',
    startTime: '',
    endTime: ''
  })
  
  const submitForm = async () => {
    if (!form.procedure || !form.date || !form.startTime || !form.endTime) return
    await addAppointment({
      ...form,
      status: 'confirmed'
    })
    emit('saved')
    emit('close')
  }
  </script>
  
  <style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  .modal-enter-active > div,
  .modal-leave-active > div {
    transition: transform 0.3s ease;
  }
  .modal-enter-from > div {
    transform: scale(0.95);
  }
  </style>