'use client';

import React, { useRef, useMemo, Suspense } from 'react'; // Restore imports
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Renamed to NetworkGraph for clarity
function NetworkGraph({ 
  count = 1250, // Reduced count again
  pointColor = "#ffffff",
  lineColor = "#ffffff",
  maxDistance = 1.5, // Threshold for connecting points
}) {
  const pointsRef = useRef<THREE.Points>(null!); 
  const linesRef = useRef<THREE.LineSegments>(null!); 

  const { positions, lineVertices } = useMemo(() => {
    const nodePositions = new Float32Array(count * 3);
    const connections = [];
    const pos = []; // Temporary array for easier vector access

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;
      pos.push(new THREE.Vector3(x, y, z));
    }

    // Calculate connections
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = pos[i].distanceTo(pos[j]);
        if (dist < maxDistance) {
          // Add line segment vertices
          connections.push(pos[i].x, pos[i].y, pos[i].z);
          connections.push(pos[j].x, pos[j].y, pos[j].z);
        }
      }
    }

    return {
      positions: nodePositions,
      lineVertices: new Float32Array(connections)
    };
  }, [count, maxDistance]);

  useFrame((state) => {
    const { mouse } = state;
    if (pointsRef.current && linesRef.current) { 
      // Animate both points and lines together
      const rotationX = THREE.MathUtils.lerp(pointsRef.current.rotation.x, -mouse.y * Math.PI / 25, 0.03);
      const rotationY = THREE.MathUtils.lerp(pointsRef.current.rotation.y, mouse.x * Math.PI / 25, 0.03);
      pointsRef.current.rotation.x = linesRef.current.rotation.x = rotationX;
      pointsRef.current.rotation.y = linesRef.current.rotation.y = rotationY;
    }
  });

  return (
    <> 
      {/* Nodes */}
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={pointColor}
          size={0.03} // Make points slightly smaller
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
      {/* Connections */}
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry attach="geometry">
          <primitive 
            attach="attributes-position" 
            object={new THREE.BufferAttribute(lineVertices, 3)} 
          />
        </bufferGeometry>
        <lineBasicMaterial 
          attach="material" 
          color={lineColor} 
          linewidth={1}
          transparent 
          opacity={0.15}
          depthWrite={false} 
        />
      </lineSegments>
    </>
  );
}

export default function HeroBackgroundAnimation() {
  return (
    // Keep z-index at default 0
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}> {/* Add Suspense back */}
           <NetworkGraph /> {/* Use the new component */}
        </Suspense>
      </Canvas>
    </div>
  );
} 