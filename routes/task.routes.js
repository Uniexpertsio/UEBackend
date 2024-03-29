const express = require('express');
const TaskController = require('../controllers/Task');

const router = express.Router();
const taskController = new TaskController();

router.post('/', taskController.createTask.bind(taskController));
router.put('/:taskId', taskController.updateTask.bind(taskController));
router.post('/response/:taskId', taskController.addResponse.bind(taskController));
router.delete('/:taskId', taskController.deleteTask.bind(taskController));
router.get('/:taskId', taskController.getTaskById.bind(taskController));
router.get('/student/:studentId', taskController.getTasksByStudentId.bind(taskController));
router.get('/application/:applicationId', taskController.getTasksByApplicationId.bind(taskController));
router.get('/comments/:taskId', taskController.getComments.bind(taskController));
router.post('/comments/:taskId', taskController.addComment.bind(taskController));

module.exports = router;
