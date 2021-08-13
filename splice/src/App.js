import React, { useState } from 'react';

// Modules
import Gameboard from './Gameboard';

const App = () => {
    const [ players, setPlayers ] = useState([]);

    return(
        <div>
            <Gameboard />
        </div>
    );
}

export default App;