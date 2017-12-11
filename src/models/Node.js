const SCALE = 300;
const MAX_HASH = 2**10;

export function hashToCoords(hash, maxHash, scale) {
  const angle = hash/maxHash * 2*Math.PI;
  const [x, y] = [scale*Math.cos(angle), scale*Math.sin(angle)];
  return [x, y];
}

export default class Node {
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