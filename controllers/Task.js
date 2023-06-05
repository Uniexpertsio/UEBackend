const TaskService = require("../service/task.service");

class TaskController {
    constructor(taskService) {
      this.taskService = new TaskService();
    }
  
    async createTask(req, res) {
      try {
        const { studentId, agentId, modifiedBy, body } = req.body;
        const task = await this.taskService.add(studentId, agentId, modifiedBy, body);
        res.status(201).json(task);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async updateTask(req, res) {
      try {
        const { modifiedBy, taskId, body } = req.body;
        await this.taskService.update(modifiedBy, taskId, body);
        res.status(200).json({ message: 'Task updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async addResponse(req, res) {
      try {
        const { modifiedBy, taskId, data } = req.body;
        await this.taskService.addResponse(modifiedBy, taskId, data);
        res.status(200).json({ message: 'Response added successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async deleteTask(req, res) {
      try {
        const { taskId } = req.params;
        await this.taskService.delete(taskId);
        res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async getTaskById(req, res) {
      try {
        const { taskId } = req.params;
        const task = await this.taskService.findById(taskId);
        res.status(200).json(task);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async getTasksByStudentId(req, res) {
      try {
        const { studentId } = req.params;
        const tasks = await this.taskService.getByStudentId(studentId);
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async getTasksByApplicationId(req, res) {
      try {
        const { applicationId } = req.params;
        const tasks = await this.taskService.getByApplicationId(applicationId);
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async getComments(req, res) {
      try {
        const { taskId } = req.params;
        const comments = await this.taskService.getComments(taskId);
        res.status(200).json(comments);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  
    async addComment(req, res) {
      try {
        const { taskId } = req.params;
        const { body, modifiedBy } = req.body;
        const comment = await this.taskService.addComment(taskId, body, modifiedBy);
        res.status(201).json(comment);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
  
  module.exports = TaskController;
  