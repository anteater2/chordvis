import React, { Component } from 'react';
import Graph from 'react-graph-vis';
import { Map, List } from 'immutable';

import log from './log.js';

import { connect } from 'react-redux';
import { addNode, updateFinger, changeLog } from './reducer';
import { createConnect } from 'react-redux/lib/connect/connect';

const SCALE = 300;
const MAX_HASH = 2**10;

const createRegex =
  /[\w*|/]* [\w*|:]* \[NODE \d*\] Keyspace position (\d*) was derived from address ([\d*|.|:]*)/;
const fingerRegex =
  /[\d|/]* [\d|:]* \[NODE (\d*)\] Updating finger (\d*) \(key \d*\) of \d* to point to node [\d|.|:]* \(key (\d*)\)/;

const sleep = async (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, time)
  });
}

function hashToCoords(hash, maxHash, scale) {
  const angle = hash/maxHash * 2*Math.PI;
  const [x, y] = [scale*Math.cos(angle), scale*Math.sin(angle)];
  return [x, y];
}

class Node {
  constructor({ hash, ip }, maxHash = MAX_HASH) {
    this.id = hash
    this.hash = hash;
    [this.x, this.y] = hashToCoords(hash, maxHash, SCALE);
    this.label = `${hash} ${ip}`;
    this.physics = false;
    this.widthConstraint = {
      minimum: 10
    }
  }
}

var options = {
  autoResize: true,
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#000000"
    },
    interaction: {
      dragNodes: true
    }
};

class ChordGraph extends Component {
  async componentDidMount() {
    const lines = log.split('\n');
    try {
      for (let line of lines) {
        await this.parseLog(line);
      }
    } catch (err) {
      throw err;
    }
  }

  parseLog = async (line) => {
    try {
      if (line === 'done') {
        this.props.handleChangeLog('DONE');
        return true;
      }
      const created = createRegex.exec(line);
      if (created) {
        this.props.handleChangeLog(line);
        await sleep(500);
        this.props.handleAddNode(created[1], created[2])
        await sleep(500);
        return true;
      }
      const fingered = fingerRegex.exec(line);
      if (fingered) {
        this.props.handleChangeLog(line);
        await sleep(500);
        this.props.handleUpdateFinger(fingered[1], fingered[2]-1, fingered[3]);
        await sleep(500);
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  }

  render() {
    const { nodes, edges } = this.props;
    return (
      <div>
        <div style={{ position: 'fixed' }}>{this.props.log}</div>
        <Graph height="100%" graph={{nodes, edges}} options={options}/>
      </div>
    );
  }
}

const mapStateToProps = ({ graph, log }) => {
  const nodes = [];
  const edges = [];

  graph.entrySeq().forEach(([key, value]) => {
    nodes.push(new Node({ hash: key, ip: value.ip }));

    value.fingers.forEach((finger, i) => {
      if (finger !== null) {
        edges.push({ from: key, to: finger, label: `${key}[${i+1}]`, smooth: {
          enabled: true,
          type: 'curvedCW',
        }})
      }
    })
  });

  console.log(nodes, edges);

  return { nodes, edges, log };
}

const mapDispatchToProps = dispatch => ({
  handleAddNode: (hash, ip) => dispatch(addNode(hash, ip)),
  handleUpdateFinger: (hash, fingerNo, pointsTo) => dispatch(updateFinger(hash, fingerNo, pointsTo)),
  handleChangeLog: (log) => dispatch(changeLog(log)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChordGraph);
