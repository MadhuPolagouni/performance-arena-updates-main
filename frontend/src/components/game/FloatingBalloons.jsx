import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

/**
 * Floating Balloons Component
 * Creates animated 3D balloons on sides of the spin wheel
 */

const Balloon = ({ position, color, delay }) => {
  const balloonRef = useRef();
  
  useFrame(({ clock }) => {
    if (!balloonRef.current) return;
    const time = clock.getElapsedTime() + delay;
    balloonRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.3;
    balloonRef.current.rotation.y += 0.005;
    balloonRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
  });
  
  return (
    <group ref={balloonRef} position={position}>
      <Sphere args={[0.5, 32, 32]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.1} 
          roughness={0.2} 
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export function FloatingBalloons({ side = 'left' }) {
  const balloonColors = [
    '#ff4d4d', // Red
    '#4da6ff', // Blue
    '#ffcc00', // Yellow
    '#ff66ff', // Pink
    '#66ff66', // Green
    '#ff9933'  // Orange
  ];
  
  const leftPositions = [
    [-3, 0, -2],
    [-2.5, 1.5, -1],
    [-3.5, -1, -3]
  ];
  
  const rightPositions = [
    [3, 0, -2],
    [2.5, 1.5, -1],
    [3.5, -1, -3]
  ];
  
  const positions = side === 'left' ? leftPositions : rightPositions;
  
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        [side === 'left' ? 'left' : 'right']: 0,
        width: '150px',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {positions.map((position, index) => (
        <Balloon 
          key={index}
          position={position}
          color={balloonColors[index % balloonColors.length]}
          delay={index * 1.5}
        />
      ))}
    </Canvas>
  );
}

export default FloatingBalloons;
