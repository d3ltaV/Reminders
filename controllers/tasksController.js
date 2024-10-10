const Tasks = require('../models/tasks');
const isAuthenticated = require('../auth');
exports.showTasks = async (req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Please login!' });
    }
    const userId = req.session.userId;
    try {
        const tasks = await Tasks.findAll({where : {userId}});
        res.render('homepage', {tasks});
        // res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({error: ":("})
    }
};
// exports.showAddTaskForm = (req, res) => {
//     res.render('addTask'); 
// };
exports.addTask = async (req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Please login!' });
    }
    const { taskName, deadline, reminderType, reminderTime, reminderInterval } = req.body;
    const userId = req.session.userId;
    try {
        const newTask = await Tasks.create({taskName, deadline, reminderType, reminderTime, reminderInterval, userId});
        res.redirect('/tasks/homepage');
    } catch (error) {
        res.status(400).json({error:'Task creation failed'});
    }
};


exports.deleteTask = async(req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Please login!' });
    }
    const taskId = req.body.taskID;
    const userId = req.session.userId;
    try {
        // const tasks = await Tasks.findAll({where: {id:taskId, userId}})
        // if (tasks.length === 0) {
        //     return res.status(400).json({error: 'No task provided or found!'});
        // }
        await Tasks.destroy({
            where:{id:taskId, userId}
        });
    } catch (error) {
        res.status(400).json({error:'Failed to delete tasks'});
    }
}

// exports.homepage = (req, res) => {
//     const userId = req.session.userId;
//     if (!userId) {
//         return res.status(401).json({error:'Please login!'});
//     }
//     res.render('homepage');
// }