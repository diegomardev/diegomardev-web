import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import Navbar from '../../../components/Navbar/Navbar';

const ThreeJSModel = () => {
  const canvasRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(5));

    const light = new THREE.SpotLight();
    light.position.set(20, 20, 20);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight*1.15, 0.1, 1000);
    camera.position.z = 100;
    camera.position.y = 40;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    renderer.setClearColor(0x242424, 1);
    canvasRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const material2 = new THREE.MeshNormalMaterial();
    const loader = new STLLoader();
    // Función para limpiar la escena
    function clearScene() {
      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          scene.remove(child);
        }
      });
    }
    // Función para cargar STL
    const loadSTL = (geometry) => {
      geometry.center();
      const mesh = new THREE.Mesh(geometry, material2);
      //mesh.position.y = 30;//cambia la altura del objeto
      scene.add(mesh);
    };

    // Cargar el archivo "cubo.stl" la primera vez
    loader.load('models/cubo.stl', loadSTL, undefined, (error) => {
      console.error('Error loading cubo.stl:', error);
    });

    // Función para manejar cambios en la entrada de archivo
    const handleFileInputChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        clearScene();
        loadSTLFile(file);
      }
    };

    // Función para manejar el evento de arrastrar y soltar
    const handleFileDrop = (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        clearScene();
        loadSTLFile(file);
      }
    };

    // Función para cargar un archivo STL
    const loadSTLFile = (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const geometry = loader.parse(event.target.result);
        loadSTL(geometry);
      };
      reader.readAsArrayBuffer(file);
    };

    // Agregar eventos para manejar el arrastrar y soltar
    canvasRef.current.addEventListener('dragover', (event) => event.preventDefault());
    canvasRef.current.addEventListener('drop', handleFileDrop);

    // Agregar eventos para manejar el cambio de entrada de archivo
    fileInputRef.current.addEventListener('change', handleFileInputChange);

    // Función de animación
    function animate() {
      scene.rotation.y += 0.001;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      // Limpieza de eventos
      canvasRef.current.removeEventListener('dragover', (event) => event.preventDefault());
      canvasRef.current.removeEventListener('drop', handleFileDrop);
      fileInputRef.current.removeEventListener('change', handleFileInputChange);
    };
  }, []);

  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 style={{ marginTop: '0px', marginBottom: '0px' }}>STL Viewer</h1>
      <input
        type="file"
        id="stl_uploads"
        name="stl_uploads"
        accept=".stl"
        className="input_image"
        ref={fileInputRef}
      />
      <div ref={canvasRef} />
    </>
  );
};

export default ThreeJSModel;
