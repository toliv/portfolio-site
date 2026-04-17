"use client";

import { useEffect, useRef, useState } from "react";

type TitleHoverVariant = "typing" | "prompt" | "cursor";

// Switch this value to test each hover treatment one at a time.
export const activeListTitleVariant: TitleHoverVariant = "typing";

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

function getTypingDelay(character: string) {
  if (character === " ") {
    return 18;
  }

  if (/[.,:;!?]/.test(character)) {
    return 42;
  }

  return 26;
}

export function InteractiveTitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopTyping() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsHovered(false);
    setIsTypingActive(false);
    setIsTypingComplete(false);
    setTypedLength(0);
  }

  function startTyping() {
    if (activeListTitleVariant !== "typing") {
      return;
    }

    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        setIsHovered(true);
        setIsTypingActive(false);
        setIsTypingComplete(true);
        setTypedLength(title.length);
        return;
      }
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsHovered(true);
    setIsTypingActive(true);
    setIsTypingComplete(false);
    setTypedLength(0);

    let nextIndex = 0;

    const tick = () => {
      nextIndex += 1;
      setTypedLength(nextIndex);

      if (nextIndex >= title.length) {
        timeoutRef.current = null;
        setIsTypingActive(false);
        setIsTypingComplete(true);
        return;
      }

      timeoutRef.current = setTimeout(
        tick,
        getTypingDelay(title.charAt(nextIndex - 1))
      );
    };

    timeoutRef.current = setTimeout(tick, 60);
  }

  useEffect(() => stopTyping, [title]);

  return (
    <span
      className={cx("interactive-title", className)}
      data-variant={activeListTitleVariant}
      data-typing-visible={
        isTypingActive || isTypingComplete ? "true" : "false"
      }
      onMouseEnter={startTyping}
      onMouseLeave={stopTyping}
      onFocus={startTyping}
      onBlur={stopTyping}
    >
      <span className="interactive-title__text">{title}</span>
      {activeListTitleVariant === "typing" ? (
        <span className="interactive-title__overlay" aria-hidden="true">
          <span className="interactive-title__prompt">{"$ > "}</span>
          {title.slice(0, typedLength)}
          {isHovered ? (
            <span className="interactive-title__caret" aria-hidden="true">
              |
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
