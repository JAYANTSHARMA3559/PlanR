const Task = require('../models/Task');

// GET /api/tasks
const getTasks = async (req, res, next) => {
    try {
        const {
            status,
            priority,
            search,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 10,
        } = req.query;

        const filter = { user: req.user._id };

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (search) {
            // use regex for partial title match - flexible for the user
            filter.title = { $regex: search, $options: 'i' };
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = {};

        if (sortBy === 'dueDate') {
            sortOptions.dueDate = sortOrder;
        } else if (sortBy === 'priority') {
            // custom sort: high > medium > low
            // handled via aggregate below
        } else {
            sortOptions[sortBy] = sortOrder;
        }

        const pageNum = Math.max(parseInt(page), 1);
        const limitNum = Math.min(parseInt(limit), 50);
        const skip = (pageNum - 1) * limitNum;

        let tasks;
        let total;

        if (sortBy === 'priority') {
            // Mongo doesn't natively sort enums in a custom order, so we do a small trick
            const priorityOrder = sortOrder === 1 ? ['low', 'medium', 'high'] : ['high', 'medium', 'low'];
            const allTasks = await Task.find(filter).lean();
            const sorted = allTasks.sort(
                (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
            );
            total = sorted.length;
            tasks = sorted.slice(skip, skip + limitNum);
        } else {
            [tasks, total] = await Promise.all([
                Task.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
                Task.countDocuments(filter),
            ]);
        }

        res.json({
            success: true,
            data: tasks,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || '',
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            user: req.user._id,
        });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        await task.save();
        res.json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// GET /api/tasks/analytics
const getAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [total, completed, inProgress, todo, overdue] = await Promise.all([
            Task.countDocuments({ user: userId }),
            Task.countDocuments({ user: userId, status: 'done' }),
            Task.countDocuments({ user: userId, status: 'in-progress' }),
            Task.countDocuments({ user: userId, status: 'todo' }),
            Task.countDocuments({
                user: userId,
                status: { $ne: 'done' },
                dueDate: { $lt: new Date() },
            }),
        ]);

        const pending = todo + inProgress;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // breakdown by priority
        const priorityBreakdown = await Task.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            data: {
                total,
                completed,
                pending,
                inProgress,
                todo,
                overdue,
                completionRate,
                priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getAnalytics };
