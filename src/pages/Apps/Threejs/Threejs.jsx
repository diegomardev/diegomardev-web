import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Threejs.css';
import Navbar from '../../../components/Navbar/Navbar';

function Threejs() {
  const canvasRef = useRef();

  useEffect(() => {
    // Crear una escena
    const scene = new THREE.Scene();

    // Crear una cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Crear un renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    // Crear el primer cubo con material de alambre
    const geometry1 = new THREE.IcosahedronGeometry(1,2);//radius, detail
    const material11 = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    const material1 = new THREE.MeshNormalMaterial({ color: 0x000000 });
    const cube1 = new THREE.Mesh(geometry1, material1);
    const cube11 = new THREE.Mesh(geometry1, material11);
    scene.add(cube1);
    scene.add(cube11);
    

    // Crear el segundo cubo con material de alambre
    const geometry2 = new THREE.BoxGeometry();
    const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const cube2 = new THREE.Mesh(geometry2, material2);
    scene.add(cube2);

    // Posicionar el segundo cubo a la derecha del primero
    cube2.position.x = 2;

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotar ambos cubos
      cube1.rotation.y += 0.01;
      cube11.rotation.y += 0.01;

      cube2.rotation.x += 0.01;
      cube2.rotation.y += 0.01;

      // Renderizar la escena
      renderer.render(scene, camera);
    };

    animate();

    // Manejar el tamaño de la ventana
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Limpiar recursos al desmontar el componente
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">Threejs</h1>
      <div ref={canvasRef} />
    </>
  );
}

export default Threejs;
