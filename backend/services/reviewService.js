const prisma = require('../prisma/client');

// ─── Ajouter un avis (médecin ou laboratoire) ─────────────────────────────────
const addReview = async (patientId, { doctorId, clinicId, appointmentId, rating, comment, isAnonymous }) => {
  if (rating < 1 || rating > 5) throw { status: 400, message: 'La note doit être entre 1 et 5.' };
  if (!doctorId && !clinicId) throw { status: 400, message: 'doctorId ou clinicId requis.' };

  if (appointmentId) {
    const appt = await prisma.appointment.findFirst({ where: { id: appointmentId, patientId, status: 'completed' } });
    if (!appt) throw { status: 403, message: "Vous ne pouvez noter qu'un rendez-vous terminé." };
  }

  const review = await prisma.review.create({
    data: {
      doctorId:     doctorId     || null,
      clinicId:     clinicId     || null,
      patientId,
      appointmentId: appointmentId || null,
      rating,
      comment,
      isAnonymous: !!isAnonymous
    }
  });

  if (doctorId) {
    const { _avg, _count } = await prisma.review.aggregate({ where: { doctorId }, _avg: { rating: true }, _count: true });
    await prisma.doctor.update({ where: { id: doctorId }, data: { ratingAvg: Math.round((_avg.rating || 0) * 10) / 10, ratingCount: _count } });
  }

  if (clinicId) {
    const { _avg, _count } = await prisma.review.aggregate({ where: { clinicId }, _avg: { rating: true }, _count: true });
    await prisma.clinic.update({ where: { id: clinicId }, data: { ratingAvg: Math.round((_avg.rating || 0) * 10) / 10, ratingCount: _count } });
  }

  return { message: 'Avis publié. Merci !', reviewId: review.id };
};

// ─── Avis d'un médecin ────────────────────────────────────────────────────────
const getDoctorReviews = async (doctorId) => {
  const [reviews, doctor] = await Promise.all([
    prisma.review.findMany({ where: { doctorId }, orderBy: { createdAt: 'desc' }, include: { patient: { select: { firstName: true, lastName: true } } } }),
    prisma.doctor.findUnique({ where: { id: doctorId }, select: { ratingAvg: true, ratingCount: true } })
  ]);
  return { reviews: reviews.map(r => ({ ...r, patient: r.isAnonymous ? { firstName: 'Anonyme', lastName: '' } : r.patient })), summary: doctor };
};

// ─── Avis d'un laboratoire ────────────────────────────────────────────────────
const getClinicReviews = async (clinicId) => {
  const [reviews, clinic] = await Promise.all([
    prisma.review.findMany({ where: { clinicId }, orderBy: { createdAt: 'desc' }, include: { patient: { select: { firstName: true, lastName: true } } } }),
    prisma.clinic.findUnique({ where: { id: clinicId }, select: { ratingAvg: true, ratingCount: true, name: true } })
  ]);
  return { reviews: reviews.map(r => ({ ...r, patient: r.isAnonymous ? { firstName: 'Anonyme', lastName: '' } : r.patient })), summary: clinic };
};

// ─── Vérifier si déjà noté ────────────────────────────────────────────────────
const hasReviewed = async (patientId, appointmentId) => {
  if (!appointmentId) return false;
  return !!(await prisma.review.findFirst({ where: { patientId, appointmentId } }));
};

module.exports = { addReview, getDoctorReviews, getClinicReviews, hasReviewed };
