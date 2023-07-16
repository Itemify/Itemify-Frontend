import { Canvas } from "@react-three/fiber";
import RendererComponent from './RendererComponent/RendererComponent';

export default function Logo(props) {
    return  <Canvas id="logo" style={{width: "500px", height:"500px"}}>
                <ambientLight intensity={0.3}/>
                <pointLight position={[3, 3, 3]} intensity={1}/>
                <RendererComponent position={[0, 0, -1]} />
            </Canvas>
}