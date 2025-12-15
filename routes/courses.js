const express = require('express');
const router = express.Router();
const courseCtrl = require('../controllers/courseController');
const { isAuth, isAdmin } = require('../middleware/authMiddleware');

router.get('/', courseCtrl.list);
router.post('/', isAuth, isAdmin, courseCtrl.create); // admin create
router.get('/:slug', courseCtrl.bySlug);
router.put('/:id', isAuth, isAdmin, courseCtrl.update);
router.delete('/:id', isAuth, isAdmin, courseCtrl.remove);
module.exports = router;
