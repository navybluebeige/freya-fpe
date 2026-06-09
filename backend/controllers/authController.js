const authService = require('../services/authService');

const registerPatient = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, wilaya } = req.body;
    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    const result = await authService.registerPatient({ email, password, firstName, lastName, phone, wilaya });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const registerDoctor = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, specialite, ordreNumber, wilaya, city, cabinetAddress, consultationPrice, bio } = req.body;
    if (!email || !password || !firstName || !lastName || !specialite || !ordreNumber || !wilaya)
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    const result = await authService.registerDoctor({ email, password, firstName, lastName, phone, specialite, ordreNumber, wilaya, city, cabinetAddress, consultationPrice, bio });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id, req.user.role);
    res.json(result);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { registerPatient, registerDoctor, login, getMe, updateProfile, changePassword };