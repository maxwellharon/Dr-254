import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase/config'
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'

export function useAppointments() {
  const appointments = ref([])
  let unsubscribe = null

  const load = () => {
    const q = collection(db, 'appointments')
    unsubscribe = onSnapshot(q, (snapshot) => {
      appointments.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    })
  }

  const addAppointment = async (data) => {
    await addDoc(collection(db, 'appointments'), data)
  }

  const deleteAppointment = async (id) => {
    await deleteDoc(doc(db, 'appointments', id))
  }

  onMounted(load)
  onUnmounted(() => unsubscribe && unsubscribe())

  return { appointments, addAppointment, deleteAppointment }
}