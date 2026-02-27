'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MolecularNet = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    // 1. Ensure our container exists before doing anything
    if (!mountRef.current) return;

    // Use the div's own dimensions for reliable routing support
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#050508', 0.03);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, -15, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Append the canvas directly to our ref
    mountRef.current.appendChild(renderer.domElement);

    // --- CREATE THE NET GEOMETRY ---
    const geometry = new THREE.PlaneGeometry(60, 60, 80, 80);
    
    const positionAttribute = geometry.attributes.position;
    const baseZ = new Float32Array(positionAttribute.count);
    const currentZ = new Float32Array(positionAttribute.count);
    
    for (let i = 0; i < positionAttribute.count; i++) {
      baseZ[i] = 0;
      currentZ[i] = 0;
    }

    // --- CREATE THE MATERIALS ---
    const nodeMaterial = new THREE.PointsMaterial({ 
      color: 0x00e5ff, 
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(geometry, nodeMaterial);

    const netMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0088aa, 
      wireframe: true,
      transparent: true, 
      opacity: 0.15
    });
    const netMesh = new THREE.Mesh(geometry, netMaterial);

    scene.add(particles);
    scene.add(netMesh);

    // --- MOUSE TRACKING ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const targetPoint = new THREE.Vector3();
    let isHovering = false;

    const handleMouseMove = (event: MouseEvent) => {
      // Always get the freshest bounds of our specific div
      if (!mountRef.current) return;
      const rectBound = mountRef.current.getBoundingClientRect();
      
      const relativeX = event.clientX - rectBound.left;
      const relativeY = event.clientY - rectBound.top;
      
      // Stop hovering if the mouse leaves our container
      if (relativeX < 0 || relativeX > rectBound.width || relativeY < 0 || relativeY > rectBound.height) {
        isHovering = false;
        return;
      }
      
      mouse.x = (relativeX / rectBound.width) * 2 - 1;
      mouse.y = -(relativeY / rectBound.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      
      const planeGeometry = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersectPoint = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(planeGeometry, intersectPoint)) {
        targetPoint.copy(intersectPoint);
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

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const influenceRadius = 4.5;
      const pressDepth = 3.0;
      const lerpSpeed = 0.1;

      // 1. Rotate the network first to update its transformation matrix
      particles.rotation.z = time * 0.02;
      netMesh.rotation.z = time * 0.02;

      // 2. Convert the world mouse coordinates into the rotating net's local space
      const localTarget = targetPoint.clone();
      netMesh.worldToLocal(localTarget);

      const positions = geometry.attributes.position.array;

      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];

        let targetZVal = baseZ[i];

        // The continuous breathing wave
        targetZVal += Math.sin(x * 0.5 + time) * 0.2;
        targetZVal += Math.cos(y * 0.5 + time) * 0.2;

        if (isHovering) {
          // Calculate distance using the localized target
          const dx = x - localTarget.x;
          const dy = y - localTarget.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < influenceRadius) {
            const normalizedDist = distance / influenceRadius;
            targetZVal -= pressDepth * Math.cos(normalizedDist * (Math.PI / 2));
          }
        }

        // Smoothly lerp to the new Z position
        currentZ[i] += (targetZVal - currentZ[i]) * lerpSpeed;
        positions[i * 3 + 2] = currentZ[i];
      }

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // --- RESIZE HANDLING ---
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const widthResize = mountRef.current.clientWidth;
      const heightResize = mountRef.current.clientHeight;
      
      camera.aspect = widthResize / heightResize;
      camera.updateProjectionMatrix();
      renderer.setSize(widthResize, heightResize);
    };

    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', handleResize);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Safely remove the canvas from the DOM to prevent React errors
      if (mountRef.current && renderer.domElement) {
        if (mountRef.current.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement);
        }
      }
      
      // Free up memory
      renderer.dispose();
      geometry.dispose();
      nodeMaterial.dispose();
      netMaterial.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-auto z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default MolecularNet;
