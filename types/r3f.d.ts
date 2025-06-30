// This file augments the @react-three/fiber types to include JSX elements for Three.js objects.
// It's often necessary if your TypeScript setup isn't automatically picking up R3F's type augmentations.
import type { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      // You can explicitly list components here if needed,
      // but extending ThreeElements should cover most.
      // Example:
      // myCustomObject: any;
    }
  }
}