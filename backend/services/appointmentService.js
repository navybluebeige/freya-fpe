const prisma = require('../prisma/client');

// ─── Prendre un RDV (médecin ou laboratoire) ──────────────────────────────────
const bookAppointment = async (patientId, body) => {
  const { doctorId, clinicId, appointmentDate, appointmentTime, motif, isFirstVisit } = body;

  if (!doctorId && !clinicId)
    throw { status: 400, message: 'doctorId ou clinicId requis.' };

  const type = clinicId ? 'lab' : 'doctor';

  // Vérifier que le médecin/labo existe
  if (doctorId) {
    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, adminApproved: true } });
    if (!doctor) throw { status: 404, message: 'Médecin introuvable.' };
  }
  if (clinicId) {
    const clinic = await prisma.clinic.findFirst({ where: { id: clinicId, adminApproved: true } });
    if (!clinic) throw { status: 404, message: 'Laboratoire introuvable.' };
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: doctorId || null,
      clinicId: clinicId || null,
      patientId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      appointmentType: type,
      motif,
      isFirstVisit: !!isFirstVisit,
    }
  });

  // Notifier le médecin ou le labo
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { firstName: true, lastName: true }
  });

  if (doctorId) {
    const docUser = await prisma.user.findFirst({
      where: { doctor: { id: doctorId } },
      select: { id: true }
    });
    if (docUser) {
      await prisma.notification.create({
        data: {
          userId: docUser.id,
          type: 'new_appointment',
          title: 'Nouveau rendez-vous',
          body: `${patient.firstName} ${patient.lastName} — ${appointmentDate} à ${appointmentTime}`,
          data: { appointmentId: appointment.id }
        }
      });
    }
  }

  if (clinicId) {
    const labUser = await prisma.user.findFirst({
      where: { clinicId, role: 'laboratory' },
      select: { id: true }
    });
    if (labUser) {
      await prisma.notification.create({
        data: {
          userId: labUser.id,
          type: 'new_appointment',
          title: 'Nouveau rendez-vous laboratoire',
          body: `${patient.firstName} ${patient.lastName} — ${appointmentDate} à ${appointmentTime}`,
          data: { appointmentId: appointment.id }
        }
      });
    }
  }

  return { message: 'Rendez-vous créé avec succès.', appointmentId: appointment.id };
};

// ─── Mes rendez-vous ──────────────────────────────────────────────────────────
const getMyAppointments = async (user, { status, page = 1, limit = 10 }) => {
  const skip = (page - 1) * parseInt(limit);
  const where = status ? { status } : {};

  if (user.role === 'patient') {
    return prisma.appointment.findMany({
      where: { patientId: user.id, ...where },
      skip, take: parseInt(limit),
      orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'desc' }],
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
        clinic: { select: { id: true, name: true, address: true, wilaya: true, phone: true } },
      }
    });
  }

  if (user.role === 'doctor') {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!doctor) return [];
    return prisma.appointment.findMany({
      where: { doctorId: doctor.id, ...where },
      skip, take: parseInt(limit),
      orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
      include: { patient: { select: { firstName: true, lastName: true, phone: true, avatar: true } } }
    });
  }

  if (user.role === 'laboratory') {
    if (!user.clinicId) return [];
    return prisma.appointment.findMany({
      where: { clinicId: user.clinicId, ...where },
      skip, take: parseInt(limit),
      orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
      include: { patient: { select: { firstName: true, lastName: true, phone: true, avatar: true } } }
    });
  }

  return [];
};

// ─── Détail d'un RDV ──────────────────────────────────────────────────────────
const getAppointmentById = async (id) => {
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      clinic: { select: { id: true, name: true, address: true, wilaya: true } },
      patient: { select: { firstName: true, lastName: true, phone: true } },
    }
  });
  if (!appt) throw { status: 404, message: 'Rendez-vous introuvable.' };
  return appt;
};

// ─── Changer le statut ────────────────────────────────────────────────────────
const updateStatus = async (id, { status, notes }, user) => {
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw { status: 404, message: 'Rendez-vous introuvable.' };

  if (user.role === 'patient' && appt.patientId !== user.id)
    throw { status: 403, message: 'Accès refusé.' };

  if (user.role === 'doctor') {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!doctor || appt.doctorId !== doctor.id) throw { status: 403, message: 'Accès refusé.' };
  }

  if (user.role === 'laboratory') {
    if (appt.clinicId !== user.clinicId) throw { status: 403, message: 'Accès refusé.' };
  }

  await prisma.appointment.update({ where: { id }, data: { status, notes } });

  const labels = { confirmed: 'confirmé', cancelled: 'annulé', completed: 'terminé' };

  // Notification au patient
  await prisma.notification.create({
    data: {
      userId: appt.patientId,
      type: 'appointment_update',
      title: `Rendez-vous ${labels[status] || status}`,
      body: `Votre rendez-vous du ${appt.appointmentDate.toISOString().split('T')[0]} à ${appt.appointmentTime} a été ${labels[status] || status}.`
    }
  });

  return { message: `Rendez-vous ${status} avec succès.` };
};

module.exports = { bookAppointment, getMyAppointments, getAppointmentById, updateStatus };
