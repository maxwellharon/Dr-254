import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase/config'
import { collection, onSnapshot } from 'firebase/firestore'

// Static procedures (mirrors the quote form)
const STATIC_PROCEDURES = [
  { id: '1', procedureName: 'Breast Reduction', category: 'SURGICAL', minPrice: 300000, maxPrice: 500000, description: 'Reduction mammoplasty.' },
  { id: '2', procedureName: 'Breast Augmentation (Implants)', category: 'SURGICAL', minPrice: 550000, maxPrice: 650000, description: 'Augmentation with implants.' },
  { id: '3', procedureName: 'Breast Augmentation (Fat)', category: 'SURGICAL', minPrice: 500000, maxPrice: 600000, description: 'Fat transfer breast augmentation.' },
  { id: '4', procedureName: 'Top Surgery', category: 'SURGICAL', minPrice: 400000, maxPrice: 400000, description: 'Chest masculinization/feminization.' },
  { id: '5', procedureName: 'Gynaecomastia', category: 'SURGICAL', minPrice: 350000, maxPrice: 350000, description: 'Male breast reduction.' },
  { id: '6', procedureName: 'Frontal Lipo', category: 'SURGICAL', minPrice: 500000, maxPrice: 500000, description: 'Liposuction of the frontal area.' },
  { id: '7', procedureName: 'Lipo 360', category: 'SURGICAL', minPrice: 600000, maxPrice: 600000, description: 'Circumferential liposuction.' },
  { id: '8', procedureName: 'Lipo Tummy Tuck', category: 'SURGICAL', minPrice: 750000, maxPrice: 750000, description: 'Combined liposuction and abdominoplasty.' },
  { id: '9', procedureName: 'Lipo 360 + BBL', category: 'SURGICAL', minPrice: 750000, maxPrice: 750000, description: '360 lipo with Brazilian butt lift.' },
  { id: '10', procedureName: 'Lipo Arms', category: 'SURGICAL', minPrice: 400000, maxPrice: 400000, description: 'Arm liposuction.' },
  { id: '11', procedureName: 'Lipo Thighs', category: 'SURGICAL', minPrice: 400000, maxPrice: 400000, description: 'Thigh liposuction.' },
  { id: '12', procedureName: 'Lipo Love Handles', category: 'SURGICAL', minPrice: 300000, maxPrice: 300000, description: 'Love handles liposuction.' },
  { id: '13', procedureName: 'Chin Lipo', category: 'SURGICAL', minPrice: 250000, maxPrice: 250000, description: 'Submental liposuction.' },
  { id: '14', procedureName: 'Breast Lift (Mastopexy)', category: 'SURGICAL', minPrice: 400000, maxPrice: 500000, description: 'Mastopexy.' },
  { id: '15', procedureName: 'Keloid Excision', category: 'SURGICAL', minPrice: 100000, maxPrice: 200000, description: 'Keloid scar removal.' },
  { id: '16', procedureName: 'Vaginoplasty', category: 'SURGICAL', minPrice: 300000, maxPrice: 300000, description: 'Vaginal rejuvenation.' },
  { id: '17', procedureName: 'Labiaplasty', category: 'SURGICAL', minPrice: 300000, maxPrice: 300000, description: 'Labial reduction.' },
  { id: '18', procedureName: 'Buccal Fat Removal (Chin)', category: 'SURGICAL', minPrice: 250000, maxPrice: 250000, description: 'Buccal fat pad excision.' },
  { id: '19', procedureName: 'Male Enhancement', category: 'SURGICAL', minPrice: 300000, maxPrice: 300000, description: 'Penile enhancement.' },
  { id: '20', procedureName: 'Rhinoplasty', category: 'SURGICAL', minPrice: 750000, maxPrice: 750000, description: 'Nose reshaping.' },
  { id: '21', procedureName: 'Botox', category: 'NON-SURGICAL', minPrice: 62500, maxPrice: 62500, description: 'Botulinum toxin injections.' },
  { id: '22', procedureName: 'Fillers', category: 'NON-SURGICAL', minPrice: 55000, maxPrice: 75000, description: 'Dermal fillers.' },
  { id: '23', procedureName: 'Medical Weight Loss (Ozempic/Mounjaro)', category: 'NON-SURGICAL', minPrice: 150000, maxPrice: 150000, description: 'Medical weight management.' }
]

export function useFirestoreData() {
  const patients = ref([])
  const inquiries = ref([])
  const procedures = ref(STATIC_PROCEDURES)
  const loading = ref(true)

  let unsubPatients = null
  let unsubInquiries = null

  // Map a Firestore doc to a patient object (dashboard expected shape)
  const mapPatient = (doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      name: d.clientName || 'Anonymous',
      email: d.email || '',
      phone: d.phone || '',
      age: Number(d.age) || null,
      Country: 'Kenya', // quote form doesn't ask for country; you can add it later
      selectedProcedure: d.procedure || 'General Consultation',
      isNonSurgical: d.procedureCategory ? d.procedureCategory.toUpperCase().includes('NON-SURGICAL') : false,
      bmi: Number(d.bmi) || null,
      weight: Number(d.weight) || null,
      height: Number(d.height) || null,
      pastSurgeries: d.pastSurgeries || 'No',
      medicalConditions: d.medicalConditions || '',
      allergies: d.allergies || '',
      smokingStatus: d.smokingStatus || '',
      alcohol: d.alcohol || '',
      calculatedPrice: Number(d.calculatedFinalCost) || 0,
      calculatedMinPrice: d.minPrice || 0,
      calculatedMaxPrice: d.maxPrice || 0,
      areasOfConcern: d.areasOfConcern || '',
      timeframe: d.timeframe || '',
      createdDate: d.timestamp ? new Date(d.timestamp.seconds * 1000).toISOString() : null,
      raw: d // keep original data
    }
  }

  const mapInquiry = (doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      email: d.email || '',
      subject: d.subject || 'No Subject',
      message: d.message || '',
      createdDate: d.timestamp ? new Date(d.timestamp.seconds * 1000).toISOString() : null
    }
  }

  onMounted(() => {
    // Listen to patients (aluora_quotes)
    unsubPatients = onSnapshot(collection(db, 'aluora_quotes'), (snapshot) => {
      patients.value = snapshot.docs.map(mapPatient)
      if (loading.value) loading.value = false
    }, (error) => {
      console.error('Error fetching patients:', error)
      loading.value = false
    })

    // Listen to inquiries (optional – change collection name if you have one)
    unsubInquiries = onSnapshot(collection(db, 'contact_messages'), (snapshot) => {
      inquiries.value = snapshot.docs.map(mapInquiry)
    }, (error) => {
      console.error('Error fetching inquiries:', error)
      // inquiries stays empty
    })
  })

  onUnmounted(() => {
    if (unsubPatients) unsubPatients()
    if (unsubInquiries) unsubInquiries()
  })

  const deletePatient = async (id) => {
    const { deleteDoc, doc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'aluora_quotes', id))
  }

  const bulkUpload = async (records) => {
    const { writeBatch, doc } = await import('firebase/firestore')
    const batch = writeBatch(db)
    records.forEach(rec => {
      const ref = doc(collection(db, 'aluora_quotes'))
      batch.set(ref, { ...rec, timestamp: new Date() })
    })
    await batch.commit()
  }

  return { patients, inquiries, procedures, loading, deletePatient, bulkUpload }
}