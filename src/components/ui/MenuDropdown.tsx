'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type DropdownOrigin =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface MenuDropdownProps {
  isOpen: boolean;
  onClose?: () => void;
  origin?: DropdownOrigin;
  className?: string;
  children: React.ReactNode;
}

export function MenuDropdown({
  isOpen,
  onClose,
  origin = 'top-center',
  className,
  children,
}: MenuDropdownProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      // Wait for the dropdown close duration token (150ms default)
      timeoutId = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 150);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return (
    <div
      ref={dropdownRef}
      data-origin={origin}
      className={cn(
        't-dropdown',
        isOpen && !isClosing && 'is-open',
        isClosing && 'is-closing',
        className
      )}
    >
      {children}
    </div>
  );
}
