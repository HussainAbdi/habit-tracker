"use client";

import { useRef, useState } from "react";
import { DRAG_DISTANCE_THRESHOLD, DRAG_VELOCITY_THRESHOLD } from "@/lib/constants";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Reusable bottom sheet component with drag-to-close functionality
 *
 * Features:
 * - Slides up from bottom with animation
 * - Drag down to close (velocity or distance based)
 * - Tap overlay to close
 * - Smooth snap-back when not closing
 */
export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  // Drag state
  const [dragY, setDragY] = useState(0);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  // Refs for drag tracking
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const lastDragY = useRef(0);
  const lastDragTime = useRef(0);
  const velocityY = useRef(0);

  // ---------------------------------------------------------------------------
  // Close Handler
  // ---------------------------------------------------------------------------

  const handleClose = () => {
    setDragY(0);
    setHasAnimatedIn(false);
    onClose();
  };

  // ---------------------------------------------------------------------------
  // Drag Handlers
  // ---------------------------------------------------------------------------

  const handleDragStart = (clientY: number) => {
    isDragging.current = true;
    dragStartY.current = clientY;
    lastDragY.current = clientY;
    lastDragTime.current = Date.now();
    velocityY.current = 0;
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging.current) return;

    // Calculate velocity with exponential moving average for smoothing
    const now = Date.now();
    const timeDelta = now - lastDragTime.current;
    if (timeDelta > 0) {
      const newVelocity = ((clientY - lastDragY.current) / timeDelta) * 1000;
      velocityY.current = velocityY.current * 0.5 + newVelocity * 0.5;
    }
    lastDragY.current = clientY;
    lastDragTime.current = now;

    // Only allow dragging down (positive delta)
    const delta = clientY - dragStartY.current;
    setDragY(Math.max(0, delta));
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const shouldClose =
      velocityY.current > DRAG_VELOCITY_THRESHOLD ||
      dragY > DRAG_DISTANCE_THRESHOLD;

    if (shouldClose) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        style={{ opacity: Math.max(0, 1 - dragY / 200) }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-2xl border-t border-slate-700 ${
          !hasAnimatedIn ? "animate-slide-up" : ""
        }`}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging.current ? "none" : "transform 0.2s ease-out"
        }}
        onAnimationEnd={() => setHasAnimatedIn(true)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onMouseMove={(e) => isDragging.current && handleDragMove(e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div className="max-w-lg mx-auto p-6">
          {/* Drag Handle */}
          <div className="flex justify-center mb-4 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1 bg-slate-600 rounded-full" />
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
