'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  className?: string;
}

// Robot arm dimensions in meters (1 cm = 0.01 m)
const DIMENSIONS = {
  base: { diameter: 0.50, height: 0.20 },
  segment1: { width: 0.10, height: 0.10, length: 0.60 },
  segment2: { width: 0.08, height: 0.08, length: 0.45 },
  segment3: { width: 0.06, height: 0.06, length: 0.25 },
  segment4: { diameter: 0.02, height: 0.10 },
  joints: {
    shoulder: 0.06,
    elbow: 0.05,
    wrist: 0.04,
    pipette: 0.015
  }
};

// Home pose angles in radians
const HOME_POSE = {
  j0: 0,                     // base yaw: 0°
  j1: -75 * Math.PI / 180,   // shoulder pitch: -30° (lift shoulder up moderately)
  j2: 45 * Math.PI / 180,    // elbow pitch: +60° (bend elbow forward)
  j3: 15 * Math.PI / 180,   // wrist pitch: -30° (adjust wrist to level)
  j4: 90 * Math.PI / 180      // pipette tilt: 0° (keep straight)
};

export default function RobotArmScene({ className = '' }: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mountRef.current) return;

    const container = mountRef.current;
    const { clientWidth: width, clientHeight: height } = container;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(1.6, 1.1, 1.8);
    camera.lookAt(0, 0, 0);

    // Renderer setup with shadows
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add renderer to DOM
    container.appendChild(renderer.domElement);

    // Materials
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666, 
      metalness: 0.3, 
      roughness: 0.7 
    });
    const segment1Material = new THREE.MeshStandardMaterial({ 
      color: 0x777777, 
      metalness: 0.3, 
      roughness: 0.7 
    });
    const segment2Material = new THREE.MeshStandardMaterial({ 
      color: 0x888888, 
      metalness: 0.3, 
      roughness: 0.7 
    });
    const segment3Material = new THREE.MeshStandardMaterial({ 
      color: 0x999999, 
      metalness: 0.3, 
      roughness: 0.7 
    });
    const pipetteMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      metalness: 0.1, 
      roughness: 0.3 
    });
    const jointMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x444444, 
      metalness: 0.5, 
      roughness: 0.5 
    });

    // Create robot arm
    const robotArm = new THREE.Group();

    // Base
    const baseGeometry = new THREE.CylinderGeometry(
      DIMENSIONS.base.diameter / 2, 
      DIMENSIONS.base.diameter / 2, 
      DIMENSIONS.base.height
    );
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = DIMENSIONS.base.height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    robotArm.add(base);

    // J0 joint (base yaw) - at top of base
    const shoulderJoint = new THREE.Mesh(
      new THREE.SphereGeometry(DIMENSIONS.joints.shoulder),
      jointMaterial
    );
    shoulderJoint.position.y = DIMENSIONS.base.height;
    shoulderJoint.castShadow = true;
    robotArm.add(shoulderJoint);

    // Create a group for everything that rotates with J0 (base yaw)
    const j0Group = new THREE.Group();
    j0Group.position.y = DIMENSIONS.base.height;
    j0Group.rotation.y = HOME_POSE.j0;
    robotArm.add(j0Group);

    // Create J1 group (shoulder pitch) - controls segment1 angle from base
    const j1Group = new THREE.Group();
    j1Group.rotation.x = HOME_POSE.j1;
    j0Group.add(j1Group);

    // Segment 1 (shoulder link) - rotates with J1
    const segment1Geometry = new THREE.BoxGeometry(
      DIMENSIONS.segment1.width,
      DIMENSIONS.segment1.height,
      DIMENSIONS.segment1.length
    );
    const segment1 = new THREE.Mesh(segment1Geometry, segment1Material);
    segment1.position.z = DIMENSIONS.segment1.length / 2;
    segment1.castShadow = true;
    segment1.receiveShadow = true;
    j1Group.add(segment1);

    // J2 joint (elbow) - at the end of segment 1
    const elbowJoint = new THREE.Mesh(
      new THREE.SphereGeometry(DIMENSIONS.joints.elbow),
      jointMaterial
    );
    elbowJoint.position.z = DIMENSIONS.segment1.length;
    elbowJoint.castShadow = true;
    j1Group.add(elbowJoint);

    // Create J2 group (elbow pitch) at the end of segment 1
    const j2Group = new THREE.Group();
    j2Group.position.z = DIMENSIONS.segment1.length;
    j2Group.rotation.x = HOME_POSE.j2;
    j1Group.add(j2Group);

    // Segment 2 (elbow link) - rotates with J2
    const segment2Geometry = new THREE.BoxGeometry(
      DIMENSIONS.segment2.width,
      DIMENSIONS.segment2.height,
      DIMENSIONS.segment2.length
    );
    const segment2 = new THREE.Mesh(segment2Geometry, segment2Material);
    segment2.position.z = DIMENSIONS.segment2.length / 2;
    segment2.castShadow = true;
    segment2.receiveShadow = true;
    j2Group.add(segment2);

    // J3 joint (wrist) - at the end of segment 2
    const wristJoint = new THREE.Mesh(
      new THREE.SphereGeometry(DIMENSIONS.joints.wrist),
      jointMaterial
    );
    wristJoint.position.z = DIMENSIONS.segment2.length;
    wristJoint.castShadow = true;
    j2Group.add(wristJoint);

    // Create J3 group (wrist pitch) at the end of segment 2
    const j3Group = new THREE.Group();
    j3Group.position.z = DIMENSIONS.segment2.length;
    j3Group.rotation.x = HOME_POSE.j3;
    j2Group.add(j3Group);

    // Segment 3 (wrist link) - rotates with J3
    const segment3Geometry = new THREE.BoxGeometry(
      DIMENSIONS.segment3.width,
      DIMENSIONS.segment3.height,
      DIMENSIONS.segment3.length
    );
    const segment3 = new THREE.Mesh(segment3Geometry, segment3Material);
    segment3.position.z = DIMENSIONS.segment3.length / 2;
    segment3.castShadow = true;
    segment3.receiveShadow = true;
    j3Group.add(segment3);

    // J4 joint (pipette) - at the end of segment 3
    const pipetteJoint = new THREE.Mesh(
      new THREE.SphereGeometry(DIMENSIONS.joints.pipette),
      jointMaterial
    );
    pipetteJoint.position.z = DIMENSIONS.segment3.length;
    pipetteJoint.castShadow = true;
    j3Group.add(pipetteJoint);

    // Create J4 group (pipette tilt) at the end of segment 3
    const j4Group = new THREE.Group();
    j4Group.position.z = DIMENSIONS.segment3.length;
    j4Group.rotation.x = HOME_POSE.j4;
    j3Group.add(j4Group);

    // Segment 4 (pipette) - rotates with J4
    const segment4Geometry = new THREE.CylinderGeometry(
      DIMENSIONS.segment4.diameter / 2,
      DIMENSIONS.segment4.diameter / 2,
      DIMENSIONS.segment4.height
    );
    const segment4 = new THREE.Mesh(segment4Geometry, pipetteMaterial);
    segment4.position.z = DIMENSIONS.segment4.height / 2;
    segment4.rotation.x = Math.PI / 2; // Rotate to align with Z axis
    segment4.castShadow = true;
    segment4.receiveShadow = true;
    j4Group.add(segment4);

    scene.add(robotArm);

    // Ground grid
    const gridHelper = new THREE.GridHelper(4, 40);
    gridHelper.receiveShadow = true;
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(0.2);
    scene.add(axesHelper);

    // Lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 4, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    scene.add(directionalLight);

    // Render once (static scene)
    renderer.render(scene, camera);

    // Cleanup function
    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      baseGeometry.dispose();
      segment1Geometry.dispose();
      segment2Geometry.dispose();
      segment3Geometry.dispose();
      segment4Geometry.dispose();
      baseMaterial.dispose();
      segment1Material.dispose();
      segment2Material.dispose();
      segment3Material.dispose();
      pipetteMaterial.dispose();
      jointMaterial.dispose();
      renderer.dispose();
    };
  }, [isClient]);

  if (!isClient) {
    return (
      <div>
        <span>Loading 3D Scene...</span>
      </div>
    );
  }

  return <div ref={mountRef} className={className} />;
}