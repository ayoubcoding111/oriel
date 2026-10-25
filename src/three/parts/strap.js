// Calfskin strap: two halves leave the lugs and wrap down around an implied wrist, tapering 20 → 16 mm,
// with saddle stitching along both edges. Built as swept rounded-rectangle sections in the watch's YZ plane.
import { BoxGeometry, BufferGeometry, Float32BufferAttribute, Group, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3 } from 'three';

const WRIST = { z: -1.62, r: 1.32 }; // implied wrist: a cylinder along X under the caseback
const THICK = 0.07;

/** Centreline in (y, z) from the spring bar down around the wrist. */
function centreline(samples) {
  const pts = [];
  const start = { y: 1.112, z: -0.128 };
  const join = 0.62; // angle (from the top of the wrist) where the strap meets it
  const r = WRIST.r + THICK / 2;
  const jy = Math.sin(join) * r;
  const jz = WRIST.z + Math.cos(join) * r;
  const lead = Math.round(samples * 0.22);
  for (let i = 0; i <= lead; i++) {
    const t = i / lead;
    // Quadratic ease from the spring bar to the join, leaving the lug almost horizontally.
    const cy = start.y + 0.26;
    const cz = start.z - 0.02;
    const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * cy + t * t * jy;
    const z = (1 - t) ** 2 * start.z + 2 * (1 - t) * t * cz + t * t * jz;
    pts.push([y, z]);
  }
  const end = 2.3;
  const rest = samples - lead;
  for (let i = 1; i <= rest; i++) {
    const a = join + ((end - join) * i) / rest;
    pts.push([Math.sin(a) * r, WRIST.z + Math.cos(a) * r]);
  }
  return pts;
}

/** Sweeps a rounded-rectangle section (width along X) along the centreline. */
function sweep(points, widthAt, ring = 20) {
  const positions = [];
  const uvs = [];
  const index = [];
  let length = 0;
  const section = [];
  // Rounded rectangle, outer face first, counter-clockwise looking along the strap.
  const corner = THICK * 0.45;
  const sides = ring / 4;
  for (let q = 0; q < 4; q++) {
    for (let i = 0; i < sides; i++) {
      const a = (q + i / sides) * (Math.PI / 2);
      const sx = q === 0 || q === 3 ? 1 : -1;
      const sy = q < 2 ? 1 : -1;
      section.push([sx, sy, Math.cos(a) * corner, Math.sin(a) * corner]);
    }
  }
  const tangent = new Vector3();
  const normal = new Vector3();
  for (let i = 0; i < points.length; i++) {
    const [y, z] = points[i];
    const [py, pz] = points[Math.max(0, i - 1)];
    const [ny, nz] = points[Math.min(points.length - 1, i + 1)];
    tangent.set(0, ny - py, nz - pz).normalize();
    normal.set(0, -tangent.z, tangent.y); // outward from the wrist
    if (i) length += Math.hypot(y - py, z - pz);
    const half = widthAt(i / (points.length - 1)) / 2;
    for (let k = 0; k < section.length; k++) {
      const [sx, sy, cx, cy] = section[k];
      const x = sx * (half - corner) + cx;
      const off = sy * (THICK / 2 - corner) + cy;
      positions.push(x, y + normal.y * off, z + normal.z * off);
      uvs.push(k / section.length, length * 1.4);
    }
  }
  const n = section.length;
  for (let i = 0; i < points.length - 1; i++) {
    for (let k = 0; k < n; k++) {
      const a = i * n + k;
      const b = i * n + ((k + 1) % n);
      const c = a + n;
      const d = b + n;
      index.push(a, c, b, b, c, d);
    }
  }
  // Cap the lug end.
  const capCentre = positions.length / 3;
  const [y0, z0] = points[0];
  positions.push(0, y0, z0);
  uvs.push(0.5, 0);
  for (let k = 0; k < n; k++) index.push(capCentre, (k + 1) % n, k);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export function createStrap({ mats, hi }) {
  const group = new Group();
  const samples = hi ? 72 : 40;
  const points = centreline(samples);
  const widthAt = (t) => 0.97 - 0.17 * Math.min(1, t * 1.6);
  const geometry = sweep(points, widthAt, hi ? 24 : 16);

  // Stitches: short dashes along both edges of the outer face, near the lugs.
  const stitchGeo = new BoxGeometry(0.008, 0.026, 0.006);
  const count = Math.round(samples * 0.75);
  const halves = [];
  const m = new Matrix4();
  const q = new Quaternion();
  const up = new Vector3(0, 1, 0);
  const dir = new Vector3();
  const pos = new Vector3();
  const scale = new Vector3(1, 1, 1);

  for (const side of [1, -1]) {
    const half = new Group();
    const leather = new Mesh(geometry, mats.leather);
    const stitches = new InstancedMesh(stitchGeo, mats.stitch, count * 2);
    let n = 0;
    for (let i = 1; i <= count; i++) {
      const [y, z] = points[i];
      const [py, pz] = points[i - 1];
      dir.set(0, y - py, z - pz).normalize();
      q.setFromUnitVectors(up, dir);
      const nx = -dir.z;
      const ny = dir.y;
      const inset = widthAt(i / (points.length - 1)) / 2 - 0.055;
      for (const edge of [-1, 1]) {
        pos.set(edge * inset, y + nx * (THICK / 2 + 0.001), z + ny * (THICK / 2 + 0.001));
        stitches.setMatrixAt(n++, m.compose(pos, q, scale));
      }
    }
    stitches.instanceMatrix.needsUpdate = true;
    half.add(leather, stitches);
    if (side < 0) half.scale.y = -1;
    group.add(half);
    halves.push(half);
  }

  return {
    group,
    /** 0..1: the halves slide out from the lugs (the stage fades them; see watch.js). */
    setPresence(value) {
      halves.forEach((half) => (half.position.y = Math.sign(half.scale.y) * (1 - value) * 0.35));
    },
    dispose() {
      geometry.dispose();
      stitchGeo.dispose();
    },
  };
}
