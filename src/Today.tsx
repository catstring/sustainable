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
}

const Overview: React.FC = () => {
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

    return (
        <div>
            <h1>Today</h1>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        {task.name} {task.overdue_indicator} - Due: {task.next_due} - Overdue: {task.is_overdue ? 'Yes' : 'No'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Overview;
