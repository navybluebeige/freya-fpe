const appointmentService = require('../services/appointmentService');

const book = async (req, res, next) => {
  try { res.status(201).json(await appointmentService.bookAppointment(req.user.id, req.body)); } catch (err) { next(err); }
};
const getMyAppointments = async (req, res, next) => {
  try { res.json(await appointmentService.getMyAppointments(req.user, req.query)); } catch (err) { next(err); }
};
const getById = async (req, res, next) => {
  try { res.json(await appointmentService.getAppointmentById(req.params.id)); } catch (err) { next(err); }
};
const updateStatus = async (req, res, next) => {
  try { res.json(await appointmentService.updateStatus(req.params.id, req.body, req.user)); } catch (err) { next(err); }
};

module.exports = { book, getMyAppointments, getById, updateStatus };