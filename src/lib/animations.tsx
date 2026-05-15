'use client';

import * as React from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

export function Reveal({ children, delay = 0 }: RevealProps) {
  return (
    <div
      style={{
        animation: `fadeIn 0.5s ease-out ${delay}s both`
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  );
}

export const fadeIn = {};
export const staggerContainer = {};
export const scaleIn = {};
