const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function getDaysUntilDue(dueDateInput) {
  const due = new Date(dueDateInput);
  if (Number.isNaN(due.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfDue - startOfToday) / msPerDay);
}

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create task & trigger notification reminder when 3 days or fewer remain
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/tasks req.body:', req.body);

    const newTask = new Task(req.body);
    const savedTask = await newTask.save();

    const daysLeft = getDaysUntilDue(savedTask.dueDate);
    const shouldNotify =
      savedTask.status !== 'Completed' &&
      daysLeft !== null &&
      daysLeft <= 3 &&
      daysLeft >= 0;

    if (shouldNotify) {
      // Use savedTask.userEmail if provided, otherwise fallback to process.env.EMAIL_USER for testing
      const recipientEmail = savedTask.userEmail || process.env.EMAIL_USER;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Task Reminder (${daysLeft} day(s) left): ${savedTask.title}`,
        text: `Hello!\n\nYour task is approaching its deadline:\n\nTask: ${savedTask.title}\nCategory: ${savedTask.category}\nPriority: ${savedTask.priority}\nDue Date: ${savedTask.dueDate}\nDays Left: ${daysLeft}\n\nGood luck with your studies!`
      };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error('Email error:', error);
        } else {
          console.log('Notification sent:', info.response);
          savedTask.reminderSent = true;
          await savedTask.save();
        }
      });
    } else {
      console.log(`No email sent for "${savedTask.title}" (days left: ${daysLeft}).`);
    }

    res.status(201).json(savedTask);
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;