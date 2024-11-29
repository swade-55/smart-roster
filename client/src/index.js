import React from "react";
import {Provider} from 'react-redux'
import store from './app/store'
import App from "./components/App";
import Modal from 'react-modal';
import {createRoot} from 'react-dom/client'
import './index.css'

// Set the app element for react-modal
Modal.setAppElement('#root');

const container = document.getElementById('root')

const root = createRoot(container);

root.render(
    <Provider store={store}>
            <App />
    </Provider>
    );
