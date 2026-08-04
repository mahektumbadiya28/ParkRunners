import React from 'react';
import { motion } from 'framer-motion';

export default function Skeleton({ className = '', variant = 'rectangular' }) {
  const baseClass = "skeleton";
  const variants = {
    rectangular: "rounded-xl",
    circular: "rounded-full",
    text: "rounded-md h-4"
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
}
