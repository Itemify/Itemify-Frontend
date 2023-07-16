import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

function RendererComponent(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
      ref.current.rotation.x += 0.003; 
      ref.current.rotation.z += 0.003;
  })
  // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh
          {...props}
          ref={ref}
          scale={clicked ? 1.2 : 1}
          onClick={(event) => click(!clicked)}
          onPointerOver={(event) => hover(true)}
          onPointerOut={(event) => hover(false)}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color={hovered ? 'grey' : 'white'} />
        </mesh>
    );
  }
  
  export default RendererComponent;