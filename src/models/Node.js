import { SCALE, MAX_HASH } from './config';

// Map a hash to to proper coordinates
const hashToCoords = (hash) => {
  const angle = hash/MAX_HASH * 2*Math.PI;
  const [x, y] = [SCALE*Math.cos(angle), SCALE*Math.sin(angle)];
  return [x, y];
};

export default class Node {
  constructor({ hash, position, ip }, maxHash = MAX_HASH) {
    [this.id, this.hash] = [hash, hash];
    [this.x, this.y] = hashToCoords(position, maxHash, SCALE);
    this.label = `${hash} ${ip}`;
    this.physics = false;
    this.widthConstraint = {
      minimum: 10
    }
  }
}