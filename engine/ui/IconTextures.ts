// engine/ui/IconTextures.ts
import * as THREE from "three"

/**
 * Creates a chat icon texture using an inline SVG.
 */
export function createChatIconTexture(): THREE.Texture {
  // Define a simple SVG for a chat bubble.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
      <rect width="128" height="128" fill="none"/>
      <path d="M20,10 h88 a10,10 0 0 1 10,10 v68 a10,10 0 0 1 -10,10 h-50 l-20,20 l-20,-20 h-18 a10,10 0 0 1 -10,-10 v-68 a10,10 0 0 1 10,-10 z"
            fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
    </svg>
  `;
  // Encode the SVG string as a URI component.
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const texture = new THREE.TextureLoader().load(dataUri);
  return texture;
}

/**
 * Creates a trade icon texture using an inline SVG.
 */
export function createTradeIconTexture(): THREE.Texture {
  // Define a simple SVG for trade: two opposing arrows.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
      <rect width="128" height="128" fill="none"/>
      <!-- Left arrow (pointing up) -->
      <line x1="38" y1="90" x2="38" y2="50" stroke="#000000" stroke-width="4"/>
      <line x1="38" y1="50" x2="28" y2="60" stroke="#000000" stroke-width="4"/>
      <line x1="38" y1="50" x2="48" y2="60" stroke="#000000" stroke-width="4"/>
      <!-- Right arrow (pointing down) -->
      <line x1="90" y1="38" x2="90" y2="78" stroke="#000000" stroke-width="4"/>
      <line x1="90" y1="78" x2="80" y2="68" stroke="#000000" stroke-width="4"/>
      <line x1="90" y1="78" x2="100" y2="68" stroke="#000000" stroke-width="4"/>
    </svg>
  `;
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const texture = new THREE.TextureLoader().load(dataUri);
  return texture;
}
