import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '../src/firebase/config'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'

export function useAppointments() {
  const appointments = ref([])
  let unsubscribe = null

  const loadAppointments = () => {
    const q = collection(db, 'appointments')
    unsubscribe = onSnapshot(q, (snapshot) => {
      appointments.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }, (error) => {
      console.error('Error fetching appointments:', error)
    })
  }

  const addAppointment = async (appointmentData) => {
    await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: Timestamp.now()
    })
  }

  const updateAppointment = async (id, data) => {
    await updateDoc(doc(db, 'appointments', id), data)
  }

  const deleteAppointment = async (id) => {
    await deleteDoc(doc(db, 'appointments', id))
  }

  onMounted(() => {
    loadAppointments()
  })

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment
  }
}