const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
// const isAuthenticated = require('../auth');

router.get('/tasks', tasksController.getTasks);
router.post('/add', tasksController.addTask);
router.get('/add', tasksController.)
router.delete('/delete', tasksController.deleteTask);
router.get('/homepage', tasksController.homepage);
module.exports = router;