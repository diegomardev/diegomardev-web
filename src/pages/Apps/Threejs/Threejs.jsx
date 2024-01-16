import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
import Navbar from '../../../components/Navbar/Navbar';

const ThreeJSModel = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(5));

    const light = new THREE.SpotLight();
    light.position.set(20, 20, 20);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;
    camera.position.y = 40;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x242424, 1); //color de fondo de la escena
    canvasRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const material1 = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const material2 = new THREE.MeshNormalMaterial();
    const loader = new STLLoader();
    loader.load(
      'models/cubo.stl',
      function (geometry) {
        geometry.center();
        const mesh1 = new THREE.Mesh(geometry, material1);
        const mesh2 = new THREE.Mesh(geometry, material2);
        //scene.add(mesh1);//ocultamos el objeto de lineas
        scene.add(mesh2);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log(error);
      }
    );


    //const stats = new Stats();
    //document.body.appendChild(stats.dom);

    function animate() {
      // Rotar ambos cubos
      scene.rotation.y += 0.001;
      requestAnimationFrame(animate);
      controls.update();
      render();
      //stats.update();
    }
    function render() {
      renderer.render(scene, camera);
    }
    animate();
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  return(
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">STL Viewer</h1>
      <div ref={canvasRef} />
    </>
  )
};

export default ThreeJSModel;
