"use client";

import { useEffect, useState } from "react";

const roles = [
  "systems integrator",
  "systems consultant",
  "control systems partner",
  "software integration support",
];

export function HeroRoleTypewriter() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(roles[0].length);
  const [isDeleting, setIsDeleting] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const currentRole = roles[roleIndex];
    const pause = characterCount === currentRole.length && !isDeleting ? 1500 : characterCount === 0 ? 320 : 52;
    const speed = isDeleting ? 34 : pause;

    const timeout = window.setTimeout(() => {
      if (isDeleting) {
        if (characterCount === 0) {
          setIsDeleting(false);
          setRoleIndex((current) => (current + 1) % roles.length);
          return;
        }

        setCharacterCount((current) => current - 1);
        return;
      }

      if (characterCount === currentRole.length) {
        setIsDeleting(true);
        return;
      }

      setCharacterCount((current) => current + 1);
    }, speed);

    return () => window.clearTimeout(timeout);
  }, [characterCount, isDeleting, roleIndex]);

  const visibleRole = roles[roleIndex].slice(0, characterCount);

  return (
    <span className="title-prefix title-typewriter" aria-label="Eltronic roles">
      <span>{visibleRole || "\u00a0"}</span>
      <span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}
