# three-clashlike-controls
"Pixel perfect" touch controls for THREE.js apps, similar to that of Clash of Clans.

## Usage
```bash
npm install --save three-clashlike-controls
```

```javascript
import createClashlikeControls from 'three-clashlike-controls';
import * as THREE from 'three';

// Set up your Scene, OrthographicCamera, and WebGLRenderer...

createClashlikeControls(camera, scene, render.domElement);
```

**Note: this requires THREE.js 0.97.0 or higher as a peer dependency.**
