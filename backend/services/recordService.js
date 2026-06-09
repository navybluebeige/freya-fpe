const prisma = require('../prisma/client');

// ─── Dossiers médicaux d'un patient ──────────────────────────────────────────
const getRecords = async (user, patientId) => {
  const targetId = user.role === 'patient' ? user.id : patientId;
  if (!targetId) throw { status: 400, message: 'patient_id requis.' };

  if (user.role === 'doctor') {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id }, select: { id: true } });
    const hasAccess = await prisma.appointment.findFirst({ where: { doctorId: doctor.id, patientId: targetId } });
    if (!hasAccess) throw { status: 403, message: 'Accès refusé. Aucun dossier partagé.' };
  }

  if (user.role === 'laboratory') {
    const hasAccess = await prisma.appointment.findFirst({ where: { clinicId: user.clinicId, patientId: targetId } });
    if (!hasAccess) throw { status: 403, message: 'Accès refusé.' };
  }

  const [records, profile, patient] = await Promise.all([
    prisma.medicalRecord.findMany({
      where: { patientId: targetId },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        clinic: { select: { id: true, name: true } },
      }
    }),
    prisma.patientProfile.findUnique({ where: { userId: targetId } }),
    prisma.user.findUnique({ where: { id: targetId }, select: { firstName: true, lastName: true, phone: true, wilaya: true } })
  ]);

  return { records, profile, patient };
};

// ─── Ajouter un document médical (médecin) ────────────────────────────────────
const addRecord = async (userId, { patientId, appointmentId, recordType, title, description, diagnosis, prescription }) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true } });
  if (!doctor) throw { status: 404, message: 'Profil médecin introuvable.' };

  const record = await prisma.medicalRecord.create({
    data: {
      patientId,
      doctorId: doctor.id,
      clinicId: null,
      appointmentId: appointmentId || null,
      recordType,
      title,
      description,
      diagnosis,
      prescription
    }
  });

  await prisma.notification.create({
    data: { userId: patientId, type: 'new_record', title: 'Nouveau document médical', body: `Nouveau document ajouté : ${title}` }
  });

  return { message: 'Document ajouté au dossier patient.', recordId: record.id };
};

// ─── Ajouter un résultat d'analyse (laboratoire) ──────────────────────────────
const addLabResult = async (clinicId, { patientId, appointmentId, title, description, diagnosis, filePath }) => {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true, name: true } });
  if (!clinic) throw { status: 404, message: 'Laboratoire introuvable.' };

  const record = await prisma.medicalRecord.create({
    data: {
      patientId,
      doctorId: null,
      clinicId,
      appointmentId: appointmentId || null,
      recordType: 'analyse',
      title,
      description,
      diagnosis,
      prescription: null,
      filePath: filePath || null,
    }
  });

  await prisma.notification.create({
    data: { userId: patientId, type: 'new_record', title: "Résultats d'analyses disponibles", body: `${clinic.name} a envoyé vos résultats : ${title}` }
  });

  return { message: 'Résultats envoyés au patient.', recordId: record.id };
};

// ─── Profil santé patient ─────────────────────────────────────────────────────
const getProfile = async (userId) => {
  return prisma.patientProfile.findUnique({ where: { userId } });
};

const updateProfile = async (userId, data) => {
  const {
    phone, bloodGroup, birthDate, gender, height, weight,
    allergies, chronicDiseases, currentMedications,
    emergencyContactName, emergencyContactPhone,
    nin, profession, insuranceType, familyAntecedents, smokingStatus,
  } = data;
  if (phone) await prisma.user.update({ where: { id: userId }, data: { phone } });
  const def = (v) => (v !== undefined ? (v || null) : undefined);
  await prisma.patientProfile.upsert({
    where: { userId },
    create: {
      userId,
      bloodType: bloodGroup || null,
      dateOfBirth: birthDate ? new Date(birthDate) : null,
      gender: gender || null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      allergies: allergies || null,
      chronicDiseases: chronicDiseases || null,
      currentMedications: currentMedications || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      nin: nin || null,
      profession: profession || null,
      insuranceType: insuranceType || null,
      familyAntecedents: familyAntecedents || null,
      smokingStatus: smokingStatus || null,
    },
    update: {
      bloodType: def(bloodGroup),
      dateOfBirth: birthDate !== undefined ? (birthDate ? new Date(birthDate) : null) : undefined,
      gender: def(gender),
      height: height !== undefined ? (height ? parseInt(height) : null) : undefined,
      weight: weight !== undefined ? (weight ? parseInt(weight) : null) : undefined,
      allergies: def(allergies),
      chronicDiseases: def(chronicDiseases),
      currentMedications: def(currentMedications),
      emergencyContactName: def(emergencyContactName),
      emergencyContactPhone: def(emergencyContactPhone),
      nin: def(nin),
      profession: def(profession),
      insuranceType: def(insuranceType),
      familyAntecedents: def(familyAntecedents),
      smokingStatus: def(smokingStatus),
    }
  });
  return { message: 'Profil de santé mis à jour.' };
};

module.exports = { getRecords, addRecord, addLabResult, getProfile, updateProfile };
