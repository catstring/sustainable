import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    created_at: string;
}

interface TaskCompletion {
    id: number;
    task: number; // Changed to task id to avoid cyclic dependency
    date: string;
    completed: boolean;
}

const TaskDate: React.FC = () => {
    const { date } = useParams<{ date: string }>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completions, setCompletions] = useState<TaskCompletion[]>([]);

    useEffect(() => {
        api.get<Task[]>('tasks/')
            .then((response) => {
                const allTasks = response.data;
                const recurringTasks = allTasks.filter(task => new Date(task.created_at) <= new Date(date));
                setTasks(recurringTasks);

                api.get<TaskCompletion[]>('task_completions/')
                    .then((res) => {
                        const taskCompletions = res.data.filter(tc => tc.date === date);
                        setCompletions(taskCompletions);
                    })
                    .catch((error) => {
                        console.error('Error fetching task completions:', error);
                    });
            })
            .catch((error) => {
                console.error('Error fetching tasks:', error);
            });
    }, [date]);

    const toggleTaskCompletion = (taskId: number) => {
        const completion = completions.find(tc => tc.task === taskId && tc.date === date);
        const updatedCompletion = completion
            ? { ...completion, completed: !completion.completed }
            : { id: 0, task: taskId, date: date || '', completed: true };

        const request = completion
            ? api.patch(`task_completions/${completion.id}/`, { completed: updatedCompletion.completed })
            : api.post('task_completions/', updatedCompletion);

        request.then((res) => {
            const newCompletion = res.data;
            setCompletions((prevCompletions) => {
                if (completion) {
                    return prevCompletions.map(tc => tc.id === completion.id ? newCompletion : tc);
                } else {
                    return [...prevCompletions, newCompletion];
                }
            });
        }).catch((error) => {
            console.error('Error updating task completion:', error);
        });
    };

    const handleDeleteTask = (taskId: number) => {
        api.delete(`tasks/${taskId}/`)
            .then(() => {
                setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
                setCompletions((prevCompletions) => prevCompletions.filter(tc => tc.task !== taskId));
            })
            .catch((error) => {
                console.error('Error deleting task:', error);
            });
    };

    return (
        <div>
            <h1>Tasks for {date}</h1>
            <ul>
                {tasks.map((task) => {
                    const completion = completions.find(tc => tc.task === task.id);
                    const isCompleted = completion ? completion.completed : false;
                    return (
                        <li key={task.id}>
                            <span
                                style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}
                            >
                                {task.name}
                            </span> 
                            {task.overdue_indicator} - Due: {task.next_due} - Overdue: {task.is_overdue ? 'Yes' : 'No'} - Completed: {isCompleted ? 'Yes' : 'No'} - Created At: {task.created_at} - Task Completion ID: {completion?.id}
                            <button onClick={() => toggleTaskCompletion(task.id)}>
                                {isCompleted ? 'Unmark Complete' : 'Mark Complete'}
                            </button>
                            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TaskDate;
