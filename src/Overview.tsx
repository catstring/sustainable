import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskRate, setNewTaskRate] = useState<number>(1);
    const [gridColors, setGridColors] = useState<string[][]>(Array(7).fill(null).map(() => Array(7).fill('white')));
    const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 });
    const [nextColor, setNextColor] = useState<string>('white');  // Add state to track the next color

    useEffect(() => {
        api.get<Task[]>('tasks/')
            .then((response) => {
                setTasks(response.data);
            })
            .catch((error) => {
                console.error('Error fetching tasks:', error);
            });
    }, []);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        api.post<Task>('tasks/', { name: newTaskName, recurring_rate: newTaskRate })
            .then((response) => {
                setTasks([...tasks, response.data]);
                setNewTaskName('');
                setNewTaskRate(1);
            })
            .catch((error) => {
                console.error('Error adding task:', error);
            });
    };

    const handleButtonClick = (color: string) => {
        setNextColor(color);  // Set the next color when the button is clicked

        if (currentPosition.row === 6 && currentPosition.col === 6 && gridColors[6][6] !== 'white') {
            handleShiftUp(color);
        } else {
            setGridColors((prevColors) => {
                const newColors = prevColors.map((row, rowIndex) => 
                    row.map((cell, colIndex) => {
                        if (rowIndex === currentPosition.row && colIndex === currentPosition.col) {
                            return color;
                        }
                        return cell;
                    })
                );
                return newColors;
            });

            setCurrentPosition((prevPosition) => {
                let { row, col } = prevPosition;
                col += 1;
                if (col >= 7) {
                    col = 0;
                    row += 1;
                    if (row >= 7) {
                        row = 6;
                        col = 6;
                    }
                }
                return { row, col };
            });
        }
    };

    const handleShiftUp = (color: string) => {
        setGridColors((prevColors) => {
            const newColors = prevColors.slice(1).concat([Array(7).fill('white')]);
            newColors[6][0] = color;  // Color the first cell in the new last row
            return newColors;
        });
        setCurrentPosition({ row: 6, col: 1 });  // Update the position to the second cell in the last row
    };

    const renderGrid = () => {
        const grid = [];
        for (let row = 0; row < 7; row++) {
            const cells = [];
            for (let col = 0; col < 7; col++) {
                cells.push(
                    <div
                        key={`${row}-${col}`}
                        className="grid-cell"
                        style={{ backgroundColor: gridColors[row][col] }}
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
                <button type="submit">Add Task</button>
            </form>
            <nav>
                <Link to="/today">Go to Today's Tasks</Link>
            </nav>
            <div className="button-container">
                <button onClick={() => handleButtonClick('green')}>True</button>
                <button onClick={() => handleButtonClick('gray')}>False</button>
                <button onClick={() => handleShiftUp(nextColor)}>Shift Up</button> {/* Use nextColor for the manual shift up */}
            </div>
            <div className="grid-container">
                {renderGrid()}
            </div>
        </div>
    );
};

export default Overview;
