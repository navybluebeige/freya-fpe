const router             = require('express').Router();
const ctrl               = require('../controllers/doctorController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/',                              ctrl.search);
router.get('/meta/specialites',             ctrl.getSpecialites);
router.get('/dashboard/stats',              auth, requireRole('doctor'), ctrl.getDashboardStats);
router.get('/profile/me',                   auth, requireRole('doctor'), ctrl.getMyProfile);
router.get('/availability/me',              auth, requireRole('doctor'), ctrl.getMyAvailability);
router.put('/profile/update',               auth, requireRole('doctor'), ctrl.updateProfile);
router.post('/availability',                auth, requireRole('doctor'), ctrl.setAvailability);
router.get('/:id',                          ctrl.getById);
router.get('/:id/availability',             ctrl.getAvailability);

module.exports = router;