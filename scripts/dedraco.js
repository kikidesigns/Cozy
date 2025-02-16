import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

async function removeDracoCompression(inputPath, outputPath) {
  // 1. Prepare glTF I/O with Draco extension and decoder
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])  // Enable KHR_draco_mesh_compression extension handling
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule()  // Provide the Draco decoder (WASM)
    });

  // 2. Read the Draco-compressed model (this will decode Draco internally)
  const doc = io.read(inputPath);

  // 3. Write the model to a new file without Draco compression
  io.write(outputPath, doc);
}

// Usage example:
await removeDracoCompression('ruby.gltf', 'ruby_decompressed.glt');
console.log('Draco compression removed successfully.');
