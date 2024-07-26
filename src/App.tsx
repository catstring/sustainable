import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Overview from './Overview';
import Today from './Today';

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
            </Routes>
        </div>
    );
};

export default App;
