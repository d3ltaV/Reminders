const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
// const isAuthenticated = require('../auth');

router.get('/homepage', tasksController.showTasks);
router.post('/add', tasksController.addTask);
// router.get('/add', tasksController.showAddTaskForm)
router.delete('/delete', tasksController.deleteTask);
// router.get('/homepage', tasksController.homepage);
module.exports = router;