import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SceneManager from './components/SceneManager';

const App = () => {

    return (
        <SceneManager />
    )
}



ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

