import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import Stats from 'three/examples/jsm/libs/stats.module';

const ThreeJSModel = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(5));

    const light = new THREE.SpotLight();
    light.position.set(20, 20, 20);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const envTexture = new THREE.CubeTextureLoader().load([
      'img/px_25.jpg',
      'img/nx_25.jpg',
      'img/py_25.jpg',
      'img/ny_25.jpg',
      'img/pz_25.jpg',
      'img/nz_25.jpg'
    ]);
    envTexture.mapping = THREE.CubeReflectionMapping;

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xb2ffc8,
      envMap: envTexture,
      metalness: 0.25,
      roughness: 0.1,
      opacity: 1.0,
      transparent: true,
      transmission: 0.99,
      clearcoat: 1.0,
      clearcoatRoughness: 0.25
    });
    const material1 = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const material2 = new THREE.MeshNormalMaterial({ color: 0xff00ff});
    const loader = new STLLoader();
    loader.load(
      'models/SquirtleSaxV1.stl',
      function (geometry) {
        const mesh1 = new THREE.Mesh(geometry, material1);
        const mesh2 = new THREE.Mesh(geometry, material2);
        scene.add(mesh1);
        scene.add(mesh2);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log(error);
      }
    );

    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    }

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    function animate() {
      requestAnimationFrame(animate);

      controls.update();

      render();

      stats.update();
    }

    function render() {
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      // Clean up resources when component unmounts
      // You might want to dispose of the loader as well if it's applicable
    };
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  return <div ref={canvasRef} />;
};

export default ThreeJSModel;
