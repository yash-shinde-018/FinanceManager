'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HelpBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    // A soft, clean background color (dark blue/grey)
    const bgColor = new THREE.Color('#0a0f1a');
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor, 0.04); // Fades the wave cleanly into the distance

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
    // Position camera slightly above looking down at the wave
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. CREATE THE PARTICLE WAVE
    const PARTICLE_SIZE = 0.15;
    const SPACING = 1.2;
    const AMOUNTX = 60;
    const AMOUNTZ = 60;

    const numParticles = AMOUNTX * AMOUNTZ;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0;
    let j = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iz = 0; iz < AMOUNTZ; iz++) {
        // Center the grid
        positions[i] = ix * SPACING - (AMOUNTX * SPACING) / 2; // x
        positions[i + 1] = 0; // y (will be animated)
        positions[i + 2] = iz * SPACING - (AMOUNTZ * SPACING) / 2; // z

        scales[j] = 1;

        i += 3;
        j++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom shader material for soft, glowing circular dots
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color('#4A90E2') }, // Soft guiding blue
      },
      vertexShader: `
        attribute float scale;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = scale * (30.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          // Make the particles circular with soft edges
          float r = 0.0;
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          r = dot(cxy, cxy);
          if (r > 1.0) discard;
          
          // Add a soft glow effect
          float alpha = 1.0 - (r * r);
          gl_FragColor = vec4(color, alpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. MOUSE INTERACTION SETUP
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const targetPoint = new THREE.Vector3();
    const mathPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    let isHovering = false;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;

      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;

      mouse.x = (relativeX / rect.width) * 2 - 1;
      mouse.y = -(relativeY / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (raycaster.ray.intersectPlane(mathPlane, targetPoint)) {
        isHovering = true;
      } else {
        isHovering = false;
      }
    };

    const handleMouseOut = () => {
      isHovering = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    // 4. ANIMATION LOOP
    let count = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      const positions = particles.geometry.attributes.position.array;
      const scales = particles.geometry.attributes.scale.array;

      let index = 0;
      let scaleIndex = 0;

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iz = 0; iz < AMOUNTZ; iz++) {
          const x = positions[index];
          const z = positions[index + 2];

          // The underlying calm wave math
          let y = (Math.sin((ix + count) * 0.3) * 1.5) + (Math.sin((iz + count) * 0.5) * 1.5);

          // Mouse interaction: Gentle repulsion effect
          if (isHovering) {
            const dx = x - targetPoint.x;
            const dz = z - targetPoint.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            const influenceRadius = 6.0;
            if (distance < influenceRadius) {
              // Push the wave up gently where the mouse hovers
              const lift = (1 - distance / influenceRadius) * 4.0;
              y += lift;
              // Make the particles slightly bigger when hovered
              scales[scaleIndex] = 1 + lift * 0.5;
            } else {
              scales[scaleIndex] = 1;
            }
          } else {
            scales[scaleIndex] = 1;
          }

          positions[index + 1] = y;

          index += 3;
          scaleIndex++;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;

      // Slowly pan the whole system forward to feel like infinite motion
      count += 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 5. RESIZE HANDLING
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-auto overflow-hidden"
    />
  );
};

export default HelpBackground;
