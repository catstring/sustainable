import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';
import Today from './Today';

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
    task: number;
    date: string;
    completed: boolean;
}

const Overview: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completions, setCompletions] = useState<TaskCompletion[]>([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskRate, setNewTaskRate] = useState<number>(1);
    const [newTaskCreatedAt, setNewTaskCreatedAt] = useState<string>(new Date().toISOString().split('T')[0]);
    const [gridColors, setGridColors] = useState<string[][]>(Array(7).fill(null).map(() => Array(7).fill('gray')));

    const navigate = useNavigate();

    useEffect(() => {
        api.get<Task[]>('tasks/')
            .then((response) => {
                setTasks(response.data);
                fetchCompletions(response.data);
            })
            .catch((error) => {
                console.error('Error fetching tasks:', error);
            });
    }, []);

    const fetchCompletions = (tasks: Task[]) => {
        api.get<TaskCompletion[]>('task_completions/')
            .then((response) => {
                setCompletions(response.data);
                updateGridColors(tasks, response.data);
            })
            .catch((error) => {
                console.error('Error fetching task completions:', error);
            });
    };

    const updateGridColors = (tasks: Task[], completions: TaskCompletion[]) => {
        const colors = Array(7).fill(null).map(() => Array(7).fill('gray'));
        if (tasks.length === 0) return;

        const earliestDate = new Date(tasks.reduce((earliest, task) => {
            return new Date(task.created_at) < new Date(earliest) ? task.created_at : earliest;
        }, tasks[0].created_at));

        const dateSequence = Array.from({ length: 49 }, (_, i) => {
            const date = new Date(earliestDate);
            date.setDate(date.getDate() + i);
            return date.toISOString().split('T')[0];
        });

        const today = new Date().toISOString().split('T')[0];

        let row = 0;
        let col = 0;
        dateSequence.forEach(date => {
            if (row < 7) {
                if (new Date(date) > new Date(today)) {
                    colors[row][col] = 'white';
                } else {
                    const isCompleted = completions.some(tc => tc.date === date && tc.completed);
                    colors[row][col] = isCompleted ? 'green' : 'gray';
                }
                col++;
                if (col >= 7) {
                    col = 0;
                    row++;
                }
            }
        });

        setGridColors(colors);
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        api.post<Task>('tasks/', { name: newTaskName, recurring_rate: newTaskRate, created_at: newTaskCreatedAt })
            .then((response) => {
                const updatedTasks = [...tasks, response.data];
                setTasks(updatedTasks);
                fetchCompletions(updatedTasks);
                setNewTaskName('');
                setNewTaskRate(1);
                setNewTaskCreatedAt(new Date().toISOString().split('T')[0]);
            })
            .catch((error) => {
                console.error('Error adding task:', error);
            });
    };

    const renderGrid = () => {
        const grid = [];
        const earliestDate = new Date(tasks.reduce((earliest, task) => {
            return new Date(task.created_at) < new Date(earliest) ? task.created_at : earliest;
        }, tasks[0]?.created_at || new Date().toISOString().split('T')[0]));

        for (let row = 0; row < 7; row++) {
            const cells = [];
            for (let col = 0; col < 7; col++) {
                const date = new Date(earliestDate);
                date.setDate(date.getDate() + row * 7 + col);
                const dateStr = date.toISOString().split('T')[0];
                cells.push(
                    <div
                        key={`${row}-${col}`}
                        className="grid-cell"
                        style={{ backgroundColor: gridColors[row][col] }}
                        onClick={() => navigate(`/tasks/${dateStr}`)}
                    ></div>
                );
            }
            grid.push(<div key={row} className="grid-row">{cells}</div>);
        }
        return grid;
    };

    return (
        <div>
            <h1>Tasks Overview</h1>
            <form onSubmit={handleAddTask}>
                <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Task Name"
                    required
                />
                <input
                    type="number"
                    value={newTaskRate}
                    onChange={(e) => setNewTaskRate(Number(e.target.value))}
                    placeholder="Recurring Rate (days)"
                    required
                    min="1"
                />
                <label>
                    Created At:
                    <input
                        type="date"
                        value={newTaskCreatedAt}
                        onChange={(e) => setNewTaskCreatedAt(e.target.value)}
                    />
                </label>
                <button type="submit">Add Task</button>
            </form>
            <nav>
                <Link to="/today">Go to Today's Tasks</Link>
            </nav>
            <div className="grid-container">
                {renderGrid()}
            </div>
            <Today />
        </div>
    );
};

export default Overview;
