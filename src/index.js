import * as THREE from 'three';

const clientToNDC = (x, y) => [
  2 * x / window.innerWidth - 1,
  -(2 * y / window.innerHeight - 1),
];

export default (camera, world, domElement) => {
  const hitbox = new THREE.Mesh(
    new THREE.BoxBufferGeometry(
      1e9,
      0.125,
      1e9,
    ),
    new THREE.MeshStandardMaterial({ color: 0xff0000 }),
  );
  hitbox.position.set(0, 0, 0);
  hitbox.material.transparent = true;
  hitbox.material.opacity = 0;
  world.add(hitbox);

  const lastTouches = {};
  const updateLastTouches = (touchList) => {
    Array.from(touchList).forEach((touch) => {
      const [x, y] = clientToNDC(touch.clientX, touch.clientY);
      lastTouches[touch.identifier] = [x, y];
    });
  };

  const handlePan = (touches) => {
    const [x, y] = clientToNDC(touches[0].clientX, touches[0].clientY);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const hits = raycaster.intersectObject(hitbox);
    if (hits.length === 0) {
      return;
    }
    const [{ point }] = hits;
    const [oldX, oldY] = lastTouches[touches[0].identifier];
    raycaster.setFromCamera(new THREE.Vector2(oldX, oldY), camera);
    const oldHits = raycaster.intersectObject(hitbox);
    if (oldHits.length === 0) {
      return;
    }
    const [{ point: oldPoint }] = oldHits;
    const delta = point.clone().sub(oldPoint);
    delta.y = 0;
    world.position.add(delta);
  };

  const handleZoom = (touches) => {
    const raycaster = new THREE.Raycaster();
    const [x0, y0] = clientToNDC(touches[0].clientX, touches[0].clientY);
    raycaster.setFromCamera(new THREE.Vector2(x0, y0), camera);
    const hits0 = raycaster.intersectObject(hitbox);
    if (hits0.length === 0) {
      return;
    }
    const [{ point: p0 }] = hits0;
    const [ox0, oy0] = lastTouches[touches[0].identifier];
    raycaster.setFromCamera(new THREE.Vector2(ox0, oy0), camera);
    const oldHits0 = raycaster.intersectObject(hitbox);
    if (oldHits0.length === 0) {
      return;
    }
    const [{ point: op0 }] = oldHits0;
    p0.y = 0;
    op0.y = 0;
    const [x1, y1] = clientToNDC(touches[1].clientX, touches[1].clientY);
    raycaster.setFromCamera(new THREE.Vector2(x1, y1), camera);
    const hits1 = raycaster.intersectObject(hitbox);
    if (hits1.length === 0) {
      return;
    }
    const [{ point: p1 }] = hits1;
    const [ox1, oy1] = lastTouches[touches[1].identifier];
    raycaster.setFromCamera(new THREE.Vector2(ox1, oy1), camera);
    const oldHits1 = raycaster.intersectObject(hitbox);
    if (oldHits1.length === 0) {
      return;
    }
    const [{ point: op1 }] = oldHits1;
    p1.y = 0;
    op1.y = 0;
    const dist = p0.clone().sub(p1).length();
    const oldDist = op0.clone().sub(op1).length();
    const scale = dist / oldDist;

    const newMp = p0.clone().add(p1).multiplyScalar(0.5);
    const oldMp = op0.clone().add(op1).multiplyScalar(0.5);
    const offset = oldMp.clone().sub(world.position).multiplyScalar(scale);
    const newMpScaled = world.position.clone().add(offset);
    const displacement = newMpScaled.clone().sub(newMp);

    world.scale.multiplyScalar(scale);
    world.position.sub(displacement);
  };

  domElement.addEventListener('touchstart', (e) => {
    updateLastTouches(e.changedTouches);
  });
  domElement.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { touches, changedTouches } = e;
    if (touches.length === 1) {
      handlePan(touches);
    } else if (touches.length === 2) {
      handleZoom(touches);
    }
    updateLastTouches(changedTouches);
  }, { passive: false });
  domElement.addEventListener('touchend', (e) => {
    Array.from(e.changedTouches).forEach((touch) => {
      delete lastTouches[touch.identifier];
    });
  });
};
