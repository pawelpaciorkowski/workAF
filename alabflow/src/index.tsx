import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { BrowserRouter } from "react-router-dom";
import AppProvider from "./_hooks";
import { EnvironmentBanner } from './globalComponents/EnvironmentBanner';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);


root.render(
    <>
        <EnvironmentBanner />
        <BrowserRouter>
            <AppProvider>
                <App />
            </AppProvider>
        </BrowserRouter>
    </>
);
