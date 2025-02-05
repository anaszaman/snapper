import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import GridSnap from './GridSnap' // Assuming GridSnap is converted to R3F

function SceneContent() {
	const sphereRef = useRef()
	const hoverMeshRef = useRef()
	const markerMeshRef = useRef()
	const snapRadius = 100
	
	// Get Three.js instances
	const { scene, camera, renderer } = useThree()

	// Setup scene elements
	return (
		<>
			<OrbitControls enableZoom />
			
			{/* Main wireframe plane (previously sphere) */}
			<mesh
				ref={sphereRef}
				position={[0, 0, -10]}
			>
				<planeGeometry args={[10, 10, 32, 32]} />
				<meshPhongMaterial color="black" wireframe />
			</mesh>

			{/* Point light */}
			<pointLight position={[10, 50, 130]} />

			{/* Hover indicator */}
			<mesh ref={hoverMeshRef}>
				<boxGeometry args={[0.1, 0.1, 1.0]} />
				<meshStandardMaterial color="blue" />
			</mesh>

			{/* Marker indicator */}
			<mesh ref={markerMeshRef}>
				<boxGeometry args={[0.1, 0.1, 1.0]} />
				<meshStandardMaterial color="red" />
			</mesh>

			{/* GridSnap handler component */}
			<GridSnapHandler
				scene={scene}
				camera={camera}
				renderer={renderer}
				mainMesh={sphereRef.current}
				snapRadius={snapRadius}
				hoverMesh={hoverMeshRef.current}
				markerMesh={markerMeshRef.current}
			/>
		</>
	)
}

// Component to handle GridSnap functionality
function GridSnapHandler({ scene, camera, renderer, mainMesh, snapRadius, hoverMesh, markerMesh }) {
	const [snap, setSnap] = useState(null)

	useEffect(() => {
		if (mainMesh && hoverMesh && markerMesh) {
			const snapInstance = new GridSnap(scene, renderer, camera, mainMesh, snapRadius, hoverMesh, markerMesh)
			setSnap(snapInstance)
		}
	}, [scene, renderer, camera, mainMesh, snapRadius, hoverMesh, markerMesh])

	useEffect(() => {
		if (!snap) return

		const handleMouseDown = (event) => snap.mouseDown(event)
		const handleMouseUp = (event) => snap.mouseUp(event)
		const handleMouseMove = (event) => snap.mouseMove(event)

		window.addEventListener('mousedown', handleMouseDown)
		window.addEventListener('mouseup', handleMouseUp)
		window.addEventListener('mousemove', handleMouseMove)

		return () => {
			window.removeEventListener('mousedown', handleMouseDown)
			window.removeEventListener('mouseup', handleMouseUp)
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [snap])

	return null
}

export default SceneContent