import React, { Component } from 'react';

import ChordGraph from './ChordGraph';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ChordGraph events={null}/>
      </div>
    );
  }
}

export default App;
