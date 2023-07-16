import React, { useRef } from 'react';
import {STLLoader} from "three/examples/jsm/loaders/STLLoader";
import { useLoader } from '@react-three/fiber';
import { Stage } from '@react-three/drei';

export const Model = ({url, color}) => {
    const geom = useLoader(STLLoader, url);
    const ref = useRef();

    color = color ? color : "rgb(30, 30, 30)";

    return (
        <Stage contactShadow={false} shadows adjustCamera intensity={0.4} environment="city" preset="soft">
            <mesh ref={ref}>
                <primitive object={geom} attach="geometry" ref={ref}/>
                <meshStandardMaterial color={color}/>
            </mesh>
        </Stage>
        
            
    );
};
