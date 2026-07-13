import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function BatSticker({ stickerVariant }) {
  const mainColor = stickerVariant === 'Blue' ? '#3b82f6' : '#eab308'; // Blue or Yellow
  const blackColor = '#111827';
  
  // Custom arrow shape for the decals at the bottom edges
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0);
  arrowShape.lineTo(0.04, 0.4);
  arrowShape.lineTo(0.08, 0);
  arrowShape.lineTo(0.04, -0.05);
  arrowShape.lineTo(0, 0);

  const arrowGeo = new THREE.ShapeGeometry(arrowShape);

  return (
    <group>
      {/* ─── MAIN "CS" LOGO ─── */}
      <group position={[0, 0.4, 0]}>
        {/* 'C' Letter */}
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.5}
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf"
          color={mainColor}
          outlineWidth={0.03}
          outlineColor={blackColor}
          fontWeight="900"
          letterSpacing={-0.05}
        >
          C
        </Text>
        
        {/* 'S' Letter */}
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.5}
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf"
          color={mainColor}
          outlineWidth={0.03}
          outlineColor={blackColor}
          fontWeight="900"
          letterSpacing={-0.05}
        >
          S
        </Text>
      </group>

      {/* ─── DIVIDER & BADGE ─── */}
      <group position={[0, -0.2, 0]}>
        {/* Horizontal Line */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.3, 0.015]} />
          <meshBasicMaterial color={blackColor} />
        </mesh>
        
        {/* Circular Badge */}
        <mesh position={[0, 0, 0.005]}>
          <circleGeometry args={[0.04, 32]} />
          <meshBasicMaterial color={mainColor} />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.03} color={blackColor} fontWeight="bold">
          CS
        </Text>
      </group>

      {/* ─── BRAND TEXT ─── */}
      <group position={[0, -0.32, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.04} color={blackColor} fontWeight="900" outlineWidth={0.002} outlineColor="#ffffff">
          CS CRICKET BAT
        </Text>
        <Text position={[0, -0.05, 0]} fontSize={0.025} color="#333333" fontWeight="bold">
          0778994389 Wariyapola
        </Text>
      </group>

      {/* ─── BOTTOM ACCENT ARROWS ─── */}
      <group position={[0, -0.6, 0]}>
        {/* Left Arrow */}
        <mesh geometry={arrowGeo} position={[-0.12, 0, 0]} rotation={[0, 0, 0]}>
          <meshBasicMaterial color={blackColor} />
        </mesh>
        {/* Right Arrow */}
        <mesh geometry={arrowGeo} position={[0.04, 0, 0]} rotation={[0, 0, 0]}>
          <meshBasicMaterial color={blackColor} />
        </mesh>
      </group>

      {/* ─── LIMITED EDITION FOOTER ─── */}
      <group position={[0, -0.9, 0]}>
        {/* CS Box */}
        <mesh position={[0, 0.1, 0]}>
          <planeGeometry args={[0.2, 0.12]} />
          <meshBasicMaterial color={blackColor} />
        </mesh>
        <Text position={[0, 0.1, 0.005]} fontSize={0.08} color={mainColor} fontWeight="900">
          CS
        </Text>
        
        {/* Footer Text */}
        <Text position={[0, 0, 0]} fontSize={0.03} color={blackColor} fontWeight="900">
          LIMITED EDITION
        </Text>
      </group>
    </group>
  );
}
