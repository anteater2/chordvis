export const createRegex =
  /[\w*|/]* [\w*|:]* \[NODE \d*\] Keyspace position (\d*) was derived from address ([\d*|.|:]*)/;
export const fingerRegex =
  /[\d|/]* [\d|:]* \[NODE (\d*)\] Updating finger (\d*) \(key \d*\) of \d* to point to node [\d|.|:]* \(key (\d*)\)/;
export const sleep = async (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, time)
  });
}