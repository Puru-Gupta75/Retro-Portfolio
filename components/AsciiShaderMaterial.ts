import * as THREE from 'three';

export const ASCII_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(100, 100) },
    uCharSize: { value: 8.0 },
    uPrimaryColor: { value: new THREE.Color('#FFB000') },
    uCRTDistortion: { value: 0.1 },
    uTime: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uCharSize;
    uniform vec3 uPrimaryColor;
    uniform float uTime;
    varying vec2 vUv;

    // Character pattern mapping
    // We use a simple 3x3 block-based approach to simulate ASCII characters
    float getCharBit(float brightness, vec2 charUv) {
      // Scale brightness to 0-1 range
      float b = clamp(brightness, 0.0, 1.0);
      
      // Define a few character thresholds
      // 0: " ", 1: ".", 2: ":", 3: "-", 4: "=", 5: "+", 6: "*", 7: "#", 8: "%", 9: "@"
      
      if (b < 0.1) return 0.0;
      if (b < 0.2) return (charUv.x > 0.4 && charUv.x < 0.6 && charUv.y > 0.4 && charUv.y < 0.6) ? 1.0 : 0.0; // .
      if (b < 0.3) return (charUv.x > 0.4 && charUv.x < 0.6 && (charUv.y > 0.3 && charUv.y < 0.4 || charUv.y > 0.6 && charUv.y < 0.7)) ? 1.0 : 0.0; // :
      if (b < 0.4) return (charUv.y > 0.45 && charUv.y < 0.55 && charUv.x > 0.3 && charUv.x < 0.7) ? 1.0 : 0.0; // -
      if (b < 0.5) return (charUv.y > 0.4 && charUv.y < 0.6 && charUv.x > 0.2 && charUv.x < 0.8) ? 1.0 : 0.0; // =
      if (b < 0.7) return (charUv.x > 0.4 && charUv.x < 0.6 || charUv.y > 0.45 && charUv.y < 0.55) ? 1.0 : 0.0; // +
      if (b < 0.9) return (charUv.x > 0.2 && charUv.x < 0.8 && charUv.y > 0.2 && charUv.y < 0.8) ? 1.0 : 0.0; // #
      return 1.0; // @ (solid block)
    }

    void main() {
      // 1. Pixelate input
      vec2 grid = uResolution / uCharSize;
      vec2 pc = floor(vUv * grid) / grid;
      
      // 2. Sample color
      vec4 texColor = texture2D(tDiffuse, pc);
      float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      
      // 3. Get coordinate within the "character cell"
      vec2 charUv = fract(vUv * grid);
      
      // 4. Determine if this pixel is part of the character
      float charMask = getCharBit(brightness, charUv);
      
      // 5. Final output
      vec3 finalColor = uPrimaryColor * charMask;
      
      // Slight flicker effect
      float flicker = 1.0 - (sin(uTime * 100.0) * 0.02);
      
      gl_FragColor = vec4(finalColor * flicker, charMask > 0.0 ? 1.0 : texColor.a);
    }
  `
};
