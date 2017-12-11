import { MAX_HASH } from './config';
import log from './log';

// Regex to match if a node was created.
// [1] = node hash, [2] = ip address
export const createRegex =
  /[\w*|/]* [\w*|:]* \[NODE \d*\] Keyspace position (\d*) was derived from address ([\d*|.|:]*)/;

// Regex to match if a finger was set.
// [1] = node hash, [2] = finger number, [3] = hash of node that finger points to
export const fingerRegex =
  /[\d|/]* [\d|:]* \[NODE (\d*)\] Updating finger (\d*) \(key \d*\) of \d* to point to node [\d|.|:]* \(key (\d*)\)/;

// sleep for `time` milliseconds
export const sleep = async (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, time)
  });
}


// Returns a map of hashes to other hashes so that they are all equidistant
const createHashMap = (log) => {
  // Return a list of all the hashes
  const getAllHashesFromLog = (log) => {
    const hashes = [];
    for (let line of log.split('\n')) {
      const created = createRegex.exec(line);
      if (created) {
        hashes.push(created[1]);
      }
    }
    return hashes;
  } 

  const hashes = getAllHashesFromLog(log);
  hashes.sort();

  const map = new Map();
  for (let i in hashes) {
    map.set(hashes[i], (MAX_HASH/(hashes.length)*i));
  }
  return map;
}

export const balancedMap = createHashMap(log);
