import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FormationPlayer {
  id?: string;
  player_name: string;
  player_position: string;
  jersey_number: number;
  position_x: number;
  position_y: number;
}

interface FootballField3DProps {
  fieldPlayers: FormationPlayer[];
}

const Field = () => {
  return (
    <>
      {/* Terrain principal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[10, 14]} />
        <meshStandardMaterial color="#2d8a3e" />
      </mesh>
      
      {/* Lignes blanches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0.8, 0.85, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Surface de réparation supérieure */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5.5]}>
        <boxGeometry args={[4, 0.05, 1.5]} />
        <meshStandardMaterial color="white" transparent opacity={0.3} />
      </mesh>
      
      {/* Surface de réparation inférieure */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5.5]}>
        <boxGeometry args={[4, 0.05, 1.5]} />
        <meshStandardMaterial color="white" transparent opacity={0.3} />
      </mesh>
      
      {/* Ligne médiane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.05, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
};

const Player3D = ({ player, index }: { player: FormationPlayer; index: number }) => {
  // Convertir les positions 2D (0-100%) en positions 3D
  const x = ((player.position_x - 50) / 100) * 10;
  const z = ((player.position_y - 50) / 100) * 14;

  return (
    <group position={[x, 0, z]}>
      {/* Corps du joueur */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      
      {/* Tête */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f9c74f" />
      </mesh>
      
      {/* Numéro du maillot */}
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {player.jersey_number}
      </Text>
      
      {/* Nom */}
      <Text
        position={[0, -0.1, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {player.player_name.split(' ').pop()}
      </Text>
    </group>
  );
};

export const FootballField3D = ({ fieldPlayers }: FootballField3DProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Vue 3D du Terrain</span>
          <Badge variant="secondary">{fieldPlayers.length} joueurs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[500px] bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg overflow-hidden">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 8, 10]} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={20}
            />
            
            {/* Lumières */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, 10, -5]} intensity={0.5} />
            
            {/* Terrain */}
            <Field />
            
            {/* Joueurs */}
            {fieldPlayers.map((player, index) => (
              <Player3D key={player.id || index} player={player} index={index} />
            ))}
          </Canvas>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Cliquez et faites glisser pour tourner • Molette pour zoomer
        </p>
      </CardContent>
    </Card>
  );
};
