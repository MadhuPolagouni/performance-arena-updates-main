import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

/**
 * 3D Scene Component for Spin Wheel
 * Creates a decorative 3D background with lighting
 */

const WheelStand = () => {
  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, -2, 0]} castShadow>
        <cylinderGeometry args={[3, 3, 0.5, 32]} />
        <meshStandardMaterial color="#4a148c" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Center pole */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 4, 32]} />
        <meshStandardMaterial color="#2c1858" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

export function Scene3D() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      opacity: 0.3
    }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <WheelStand />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}

export default Scene3D;
