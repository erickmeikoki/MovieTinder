import { keyframes } from "@emotion/react";

// Animation keyframes
export const swipeRightAnimation = keyframes`
  from {
    transform: translateX(0) rotate(0);
  }
  to {
    transform: translateX(150%) rotate(30deg);
    opacity: 0;
  }
`;

export const swipeLeftAnimation = keyframes`
  from {
    transform: translateX(0) rotate(0);
  }
  to {
    transform: translateX(-150%) rotate(-30deg);
    opacity: 0;
  }
`;

export const saveAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  75% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
`;

export const likeAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: rotate(15deg);
  }
  75% {
    transform: rotate(-15deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
`;

export const heartTrailAnimation = keyframes`
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translateY(-150px) scale(1.5);
    opacity: 0;
  }
`;
