const prisma = require('../prisma/client');

// ─── Recherche médecins (public) ──────────────────────────────────────────────
const searchDoctors = async ({ specialite, wilaya, name, page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;
  const where = {
    adminApproved: true,
    user: { isActive: true },
    ...(specialite && { specialite: { contains: specialite, mode: 'insensitive' } }),
    ...(wilaya     && { wilaya:     { contains: wilaya,     mode: 'insensitive' } }),
    ...(name       && { user: { OR: [
      { firstName: { contains: name, mode: 'insensitive' } },
      { lastName:  { contains: name, mode: 'insensitive' } },
    ]}}),
  };

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where, skip, take: parseInt(limit),
      orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } } }
    }),
    prisma.doctor.count({ where })
  ]);

  return { doctors, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

// ─── Profil médecin du médecin connecté ──────────────────────────────────────
const getDoctorByUserId = async (userId) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } } }
  });
  if (!doctor) throw { status: 404, message: 'Profil médecin introuvable.' };
  return doctor;
};

// ─── Profil médecin par ID (public) ───────────────────────────────────────────
const getDoctorById = async (id) => {
  const doctor = await prisma.doctor.findFirst({
    where: { id, adminApproved: true },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true, createdAt: true } },
      availabilities: true,
      reviews: {
        take: 10, orderBy: { createdAt: 'desc' },
        include: { patient: { select: { firstName: true, lastName: true } } }
      },
    }
  });
  if (!doctor) throw { status: 404, message: 'Médecin introuvable.' };
  return doctor;
};

// ─── Disponibilités d'un médecin pour une date ────────────────────────────────
const getAvailability = async (doctorId, date) => {
  const dayOfWeek = new Date(date).getDay();

  const [slots, bookedRaw] = await Promise.all([
    prisma.availability.findMany({
      where: { doctorId, isAvailable: true, OR: [{ dayOfWeek }, { specificDate: new Date(date) }] }
    }),
    prisma.appointment.findMany({
      where: { doctorId, appointmentDate: new Date(date), status: { notIn: ['cancelled'] } },
      select: { appointmentTime: true }
    })
  ]);

  const bookedTimes = bookedRaw.map(a => a.appointmentTime);
  return { slots, bookedTimes };
};

// ─── Stats dashboard médecin ──────────────────────────────────────────────────
const getDashboardStats = async (userId) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true, ratingAvg: true, ratingCount: true } });
  if (!doctor) throw { status: 404, message: 'Profil médecin introuvable.' };

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const [total, todayCount, pending, patients, unreadMsgs, upcoming] = await Promise.all([
    prisma.appointment.count({ where: { doctorId: doctor.id } }),
    prisma.appointment.count({ where: { doctorId: doctor.id, appointmentDate: { gte: today, lt: tomorrow }, status: 'confirmed' } }),
    prisma.appointment.count({ where: { doctorId: doctor.id, status: 'pending' } }),
    prisma.appointment.findMany({ where: { doctorId: doctor.id }, select: { patientId: true }, distinct: ['patientId'] }),
    prisma.message.count({ where: { conversation: { doctorId: doctor.id }, senderId: { not: userId }, isRead: false } }),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, appointmentDate: { gte: today }, status: { in: ['pending', 'confirmed'] } },
      orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
      take: 10,
      include: { patient: { select: { firstName: true, lastName: true, phone: true } } }
    }),
  ]);

  return {
    stats: { totalAppointments: total, todayAppointments: todayCount, pendingAppointments: pending, totalPatients: patients.length, unreadMessages: unreadMsgs, ratingAvg: doctor.ratingAvg, ratingCount: doctor.ratingCount },
    upcoming
  };
};

// ─── Mise à jour profil médecin ───────────────────────────────────────────────
const updateDoctorProfile = async (userId, data) => {
  await prisma.doctor.update({ where: { userId }, data });
  return { message: 'Profil médecin mis à jour.' };
};

// ─── Définir les disponibilités ───────────────────────────────────────────────
const setAvailability = async (userId, slots) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true } });
  if (!doctor) throw { status: 404, message: 'Profil médecin introuvable.' };

  await prisma.availability.deleteMany({ where: { doctorId: doctor.id } });
  await prisma.availability.createMany({
    data: slots.map(s => ({ doctorId: doctor.id, dayOfWeek: s.dayOfWeek ?? null, specificDate: s.specificDate ? new Date(s.specificDate) : null, startTime: s.startTime, endTime: s.endTime, slotDuration: s.slotDuration || 30 }))
  });
  return { message: 'Disponibilités mises à jour.' };
};

// ─── Liste des spécialités ────────────────────────────────────────────────────
const getSpecialites = () => [
  'Médecin Généraliste','Cardiologue','Dermatologue','Gynécologue','Pédiatre',
  'Ophtalmologue','Neurologue','Orthopédiste','Pneumologue','Endocrinologue',
  'Gastro-entérologue','Rhumatologue','Radiologue','Chirurgien','Psychiatre',
  'Urologue','ORL','Dentiste','Stomatologiste','Néphrologue','Hématologue',
  'Infectiologue','Oncologue','Anesthésiste','Médecin du Sport',
];

module.exports = { searchDoctors, getDoctorByUserId, getDoctorById, getAvailability, getDashboardStats, updateDoctorProfile, setAvailability, getSpecialites };