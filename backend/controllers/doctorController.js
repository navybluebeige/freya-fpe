// ============================================================
//  doctorController.js
// ============================================================
const doctorService = require('../services/doctorService');

const search = async (req, res, next) => {
  try { res.json(await doctorService.searchDoctors(req.query)); } catch (err) { next(err); }
};
const getById = async (req, res, next) => {
  try { res.json(await doctorService.getDoctorById(req.params.id)); } catch (err) { next(err); }
};
const getAvailability = async (req, res, next) => {
  try { res.json(await doctorService.getAvailability(req.params.id, req.query.date)); } catch (err) { next(err); }
};
const getDashboardStats = async (req, res, next) => {
  try { res.json(await doctorService.getDashboardStats(req.user.id)); } catch (err) { next(err); }
};
const getMyProfile = async (req, res, next) => {
  try { res.json(await doctorService.getDoctorByUserId(req.user.id)); } catch (err) { next(err); }
};
const getMyAvailability = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    const slots  = await require('../prisma/client').availability.findMany({
      where: { doctorId: doctor.id },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json({ slots });
  } catch (err) { next(err); }
};
const updateProfile = async (req, res, next) => {
  try { res.json(await doctorService.updateDoctorProfile(req.user.id, req.body)); } catch (err) { next(err); }
};
const setAvailability = async (req, res, next) => {
  try { res.json(await doctorService.setAvailability(req.user.id, req.body.slots)); } catch (err) { next(err); }
};
const getSpecialites = (req, res) => res.json(doctorService.getSpecialites());

module.exports = { search, getById, getAvailability, getMyProfile, getMyAvailability, getDashboardStats, updateProfile, setAvailability, getSpecialites };