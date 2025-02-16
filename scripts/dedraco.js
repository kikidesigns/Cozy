const { NodeIO } = require('@gltf-transform/core');
const { KHRDracoMeshCompression } = require('@gltf-transform/extensions');
const { decompress } = require('@gltf-transform/functions');
const draco3d = require('draco3dgltf');

async function removeDracoCompression(inputPath, outputPath) {
  // 1. Set up NodeIO with Draco extension support.
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      // Registering an encoder is optional; we won't re‑compress.
      'draco3d.encoder': await draco3d.createEncoderModule()
    });

  // 2. Read the Draco-compressed model.
  const doc = await io.read(inputPath);

  // 3. Decompress the document.
  // This transform decodes Draco-compressed meshes and removes all Draco extension references.
  await decompress(doc);

  // 4. Write the uncompressed model to disk.
  await io.write(outputPath, doc);
}

// Usage example:
removeDracoCompression(
  '/Users/christopherdavid/code/Cozy/scripts/ruby.gltf',
  '/Users/christopherdavid/code/Cozy/scripts/ruby_dec.gltf'
)
  .then(() => console.log('Draco compression removed successfully.'))
  .catch(err => console.error('Error:', err));
