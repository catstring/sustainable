import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Overview from './Overview';
import Today from './Today';
import TaskDate from './TaskDate';

const App: React.FC = () => {
    return (
        <div>
            <nav>
                <Link to="/">Overview</Link>
                <Link to="/today">Today</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/today" element={<Today />} />
                <Route path="/tasks/:date" element={<TaskDate />} />
            </Routes>
        </div>
    );
};

export default App;
