const Tasks = require('../models/tasks');
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Tasks.findAll();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({error: ":("})
    }
};

exports.addTask = async(req, res) => {
    const {taskName, deadline, reminderTime} = req.body;
    try {
        const newTask = await Tasks.create({ taskName, deadline, reminderTime }); 
        res.status(200).json(newTask);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create task' });
    }
};