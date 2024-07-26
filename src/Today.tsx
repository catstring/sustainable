import React, { useState, useEffect } from 'react';
import api from './api';

interface Task {
    id: number;
    name: string;
    recurring_rate: number;
    last_done: string | null;
    next_due: string;
    is_overdue: boolean;
    overdue_days: number;
    should_display_overdue: boolean;
    overdue_indicator: string;
    completed: boolean;
    created_at: string;
}

const Today: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        api.get<Task[]>('tasks/')
            .then((response) => {
                setTasks(response.data);
            })
            .catch((error) => {
                console.error('Error fetching tasks:', error);
            });
    }, []);

    const toggleTaskCompletion = (taskId: number) => {
        const taskToToggle = tasks.find(task => task.id === taskId);
        if (taskToToggle) {
            const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };

            // Update the server with the new completion status
            api.patch(`tasks/${taskId}/`, {
                completed: updatedTask.completed,
            }).then(() => {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === taskId ? updatedTask : task
                    )
                );
            }).catch((error) => {
                console.error('Error updating task status:', error);
            });
        }
    };

    const handleDeleteTask = (taskId: number) => {
        // Send a DELETE request to the server
        api.delete(`tasks/${taskId}/`)
            .then(() => {
                // Update the local state to remove the deleted task
                setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
            })
            .catch((error) => {
                console.error('Error deleting task:', error);
            });
    };

    return (
        <div>
            <h1>Today</h1>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <span
                            onClick={() => toggleTaskCompletion(task.id)}
                            style={{ textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                        >
                            {task.name}
                        </span>
                        {task.overdue_indicator} - Due: {task.next_due} - Overdue: {task.is_overdue ? 'Yes' : 'No'} - Completed: {task.completed ? 'Yes' : 'No'} - Created At: {task.created_at}
                        <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Today;
