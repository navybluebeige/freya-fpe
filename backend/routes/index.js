// ─── appointments.js ──────────────────────────────────────────────────────────
const express  = require('express');
const { auth, requireRole } = require('../middleware/auth');
const apptCtrl = require('../controllers/appointmentController');
const msgCtrl  = require('../controllers/messageController');
const { recordController, reviewController, adminController, notificationController } = require('../controllers/otherControllers');

// Appointments
const appointmentsRouter = express.Router();
appointmentsRouter.post('/',              auth, requireRole('patient'), apptCtrl.book);
appointmentsRouter.get('/my',            auth,                         apptCtrl.getMyAppointments);
appointmentsRouter.get('/:id',           auth,                         apptCtrl.getById);
appointmentsRouter.patch('/:id/status',  auth,                         apptCtrl.updateStatus);

// Messages
const messagesRouter = express.Router();
messagesRouter.get('/conversations',                   auth, msgCtrl.getConversations);
messagesRouter.post('/conversations',                  auth, msgCtrl.createConversation);
messagesRouter.get('/conversations/:id/messages',      auth, msgCtrl.getMessages);
messagesRouter.post('/conversations/:id/messages',     auth, msgCtrl.sendMessage);

// Records
const recordsRouter = express.Router();
recordsRouter.get('/',          auth,                         recordController.getRecords);
recordsRouter.post('/',         auth, requireRole('doctor'),  recordController.addRecord);
recordsRouter.get('/profile',   auth, requireRole('patient'), recordController.getProfile);
recordsRouter.put('/profile',   auth, requireRole('patient'), recordController.updateProfile);

// Reviews
const reviewsRouter = express.Router();
reviewsRouter.post('/',                             auth, requireRole('patient'), reviewController.addReview);
reviewsRouter.get('/doctor/:doctorId',                                            reviewController.getDoctorReviews);
reviewsRouter.get('/clinic/:clinicId',                                            reviewController.getClinicReviews);
reviewsRouter.get('/has/:appointmentId',            auth,                         reviewController.hasReviewed);

// Admin
const adminRouter = express.Router();
adminRouter.use(auth, requireRole('admin'));
adminRouter.get('/stats',                  adminController.getStats);
adminRouter.get('/doctors/pending',        adminController.getPending);
adminRouter.get('/doctors',                adminController.getAllDoctors);
adminRouter.patch('/doctors/:id/approve',  adminController.approveDoctor);
adminRouter.patch('/users/:id/toggle',     adminController.toggleUser);
adminRouter.delete('/users/:id',           adminController.deleteUser);
adminRouter.get('/clinics',                adminController.getClinics);
adminRouter.post('/clinics',               adminController.addClinic);
adminRouter.get('/patients',               adminController.getAllPatients);
adminRouter.get('/appointments',           adminController.getAllAppointments);
adminRouter.get('/labs',                   adminController.getAllLabs);
adminRouter.patch('/labs/:id/toggle',      adminController.toggleLab);

// Notifications
const notificationsRouter = express.Router();
notificationsRouter.get('/',            auth, notificationController.getAll);
notificationsRouter.patch('/read-all',  auth, notificationController.markAllRead);
notificationsRouter.patch('/:id/read', auth, notificationController.markRead);


module.exports = { appointmentsRouter, messagesRouter, recordsRouter, reviewsRouter, adminRouter, notificationsRouter };