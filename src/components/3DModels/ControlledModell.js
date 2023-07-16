import { Canvas } from '@react-three/fiber';
import { Model } from '../3DModels/Model';
import { PresentationControls } from '@react-three/drei';
import React, { Suspense } from 'react';

function ControlledModel(props) {
    return (
        <Canvas camera={{ position: [0, 100, 0] }}>
            <Suspense fallback={null}>
                <color attach="background" args={["white"]} />
                <ambientLight/>
                <pointLight position={[10, 10, 10]}/>
                    

                <PresentationControls
                    polar={[-Infinity, +Infinity]}>
                    <Model url={process.env.REACT_APP_S3_BUCKET_URL + props.itemID + "/" + props.filename} />
                      
                </PresentationControls>
            </Suspense>
        </Canvas>
    )
}

export default ControlledModel;
