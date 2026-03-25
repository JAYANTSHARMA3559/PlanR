const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getAnalytics,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.get('/analytics', getAnalytics);

router.route('/').get(getTasks).post(createTask);

router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
