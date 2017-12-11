import React, { Component } from 'react';
import Graph from 'react-graph-vis';

import log from '../models/log.js';
import { connect } from 'react-redux';
import { addNode, updateFinger, changeLog } from '../models/reducer';
import { createRegex, fingerRegex, sleep, balancedMap } from '../models/utils';
import Node from '../models/Node';

const options = {
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
  state = {
    filter: null,
  }

  events = {
    selectNode: ({ nodes }) => {
      const node = nodes[0];
      this.setState({ filter: node });
    },

    deselectNode: () => {
      this.setState({ filter: null });
    }
  }

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
    const filteredEdges = this.state.filter === null ?
      edges :
      edges.filter(({ from }) => from === this.state.filter);
    return (
      <div>
        <div style={{ position: 'fixed' }}>
          {this.props.log}
          <br/>
          filter: {this.state.filter}
        </div>
        <Graph height="100%" graph={{nodes, edges: filteredEdges }} options={options} events={this.events}/>
      </div>
    );
  }
}

const mapStateToProps = ({ graph, log }) => {
  const nodes = [];
  const edges = [];


  for (let [hash, node] of graph.entrySeq()) {
    const edgeToFingerNo = new Map();
    nodes.push(new Node({ hash, ip: node.ip, position: node.position }));

    const fingerArray = node.fingers.toArray();
    for (let i in fingerArray) {
      i = Number.parseInt(i);
      const finger = fingerArray[i];
      if (finger !== null) {
        if (edgeToFingerNo.has(finger)) {
          edgeToFingerNo.get(finger).push(i+1);
        } else {
          edgeToFingerNo.set(finger, [i+1]);
        }
      }
    }
    for (let [finger, iArr] of edgeToFingerNo) {
      edges.push({
        from: hash,
        to: finger,
        label: `${hash}[${iArr.join(',')}]`,
        smooth: {
          enabled: true,
          type: 'curvedCW'
        }
      });
    }
  }


  return { nodes, edges, log };
}

const mapDispatchToProps = dispatch => ({
  handleAddNode: (hash, ip) => dispatch(addNode({ position: balancedMap.get(hash), hash, ip })),
  handleUpdateFinger: (hash, fingerNo, pointsTo) => dispatch(updateFinger({ hash, fingerNo, pointsTo })),
  handleChangeLog: (log) => dispatch(changeLog(log)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChordGraph);
