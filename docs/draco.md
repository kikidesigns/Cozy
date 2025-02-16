Removing Draco Compression from glTF/GLB in a JavaScript Script

Removing Draco mesh compression from a glTF/GLB involves decoding the compressed geometry and re-saving the model with all original data intact. This ensures the output file no longer requires Draco decoding at runtime (making it loadable with a standard GLTF loader) while preserving all geometry attributes, materials, animations, and other metadata. Below, we outline best practices and an efficient implementation for decompressing Draco in a lightweight standalone script.

Understanding Draco Compression in glTF

Draco is an extension to glTF (KHR_draco_mesh_compression) that significantly reduces mesh sizes (often by ~95%) by compressing vertex data ￼. However, Draco compression is lossy – some precision is lost during compression, so repeatedly compressing and decompressing is not advised ￼. Importantly, Draco decoding must occur before GPU upload, adding CPU cost at load time ￼. Removing Draco compression (i.e. decoding the meshes to raw geometry) can be useful for:
	•	Ensuring compatibility with platforms or engines that don’t support Draco (or to avoid bundling the Draco decoder).
	•	Preparing assets for editing or further processing (since tools can operate on the full geometry data).
	•	Reducing runtime parse latency – the model is larger but requires no special decoding at load.

Key idea: A Draco-compressed glTF stores mesh attributes in a special compressed form. To remove compression, we decode those attributes back to normal arrays and update the glTF file to use the raw data (removing the KHR_draco_mesh_compression extension). The result is a standard glTF 2.0 model with the same geometry, just uncompressed.

Best Practices for Decompressing Draco Models

Use established glTF libraries or tools – Rather than writing a decoder from scratch, leverage widely-used libraries that handle glTF parsing and Draco decoding. This ensures all parts of the model are preserved and that the output remains spec-compliant. Some recommended approaches:
	•	glTF-Transform (Node.js library/CLI): A popular glTF 2.0 toolkit that can read a Draco-compressed glTF, decode it, and write it out uncompressed ￼. It uses the official Draco decoder under the hood and preserves the entire scene structure. This is a lightweight solution (no heavy 3D engine needed) and is widely used in the glTF community ￼.
	•	Three.js GLTFLoader + GLTFExporter: Load the Draco-compressed GLB into a Three.js scene (using GLTFLoader with DRACOLoader), then export it using GLTFExporter. This will naturally produce an uncompressed glTF/GLB because GLTFExporter doesn’t apply Draco compression by default ￼. This method works but brings in the Three.js library (heavier) – use it only if you already rely on Three.js or cannot use other tools ￼.
	•	Khronos glTF-Pipeline: This Node tool can compress meshes with Draco but has no one-step “decompress” command. It offers an option to include uncompressed fallbacks (--draco.uncompressedFallback) ￼, but using glTF-Transform is generally simpler for full decompression.

Ensure Draco decoder availability: If using a tool programmatically, you must provide the Draco decoder module. For example, glTF-Transform expects a decoder from the draco3dgltf npm package to be registered before reading Draco files ￼. This decoder handles the low-level conversion of compressed bits back to vertices.

Preserve all data: A good decompression workflow will retain all attributes, materials, animations, skins, etc. from the original file. Libraries like glTF-Transform and Three.js ensure that decoding the geometry doesn’t strip out or alter other parts of the model – they simply replace compressed geometry with the equivalent raw data. The goal is that aside from the removal of the Draco extension, the model is identical. (Do note that Draco’s quantization might have altered vertex precision slightly, but that is inherent from the original compression step.)

Optimize the output: Once decompressed, the file size will increase (since geometry is stored raw). To keep it efficient and compatible:
	•	Use binary .glb format for output (unless you specifically need .gltf+.bin). A GLB embeds JSON, buffers, and images in one file, which is convenient and avoids managing multiple files.
	•	Remove the KHR_draco_mesh_compression extension references – Any decent glTF writer will do this when saving the decoded model. This ensures the output doesn’t advertise an extension it no longer uses.
	•	Keep data types optimized: Draco decompression might sometimes promote vertex index data to a larger type (e.g., 16-bit to 32-bit indices) in edge cases ￼. If file size is critical, you can post-process indices or use tools (or glTF-Transform functions) to weld vertices or downgrade index precision if possible ￼. This step is optional but can optimize the file size if needed, while still preserving visual fidelity.
	•	Verify in Three.js: As a final check, load the result with Three.js’s GLTFLoader (without Draco) to confirm that all meshes, animations, and materials render correctly. This guarantees the model remains fully compatible with Three.js rendering pipeline (and other engines).

Using glTF-Transform to Remove Draco Compression

One of the most efficient and straightforward methods is to use the glTF-Transform library (by Don McCurdy). glTF-Transform is a lightweight toolkit specifically for glTF operations, and it is widely recommended for tasks like this ￼. It can be used as a CLI (for a one-off conversion) or as part of a Node.js script for automation.

How it works: glTF-Transform will parse the Draco-compressed glTF/GLB, automatically decode the Draco geometry (when the decoder is provided) and then output a new glTF/GLB without the Draco extension. All mesh data is preserved exactly (apart from the compression loss) – the library essentially performs a lossless transcoding of the mesh data from compressed to uncompressed form ￼.

Steps using glTF-Transform in Node.js:
	1.	Install dependencies: You’ll need @gltf-transform/core, @gltf-transform/extensions, and the Draco decoder. For example: npm install @gltf-transform/core @gltf-transform/extensions draco3dgltf. (These are small packages; much lighter than Three.js.)
	2.	Initialize I/O with Draco support: Register the Draco mesh compression extension and the decoder module with glTF-Transform’s NodeIO. This lets the loader know how to handle Draco data ￼.
	3.	Read the input GLB/GLTF: Use NodeIO.read() to load your Draco-compressed model. The library will detect the KHR_draco_mesh_compression extension in the file and invoke the Draco decoder to decompress mesh primitives on the fly.
	4.	Write out the model: Use NodeIO.write() to save the document to a new file. The output will contain the same mesh data in uncompressed form (and glTF-Transform will exclude the Draco extension since it’s no longer needed). All original scenes, nodes, animations, cameras, etc., remain unchanged – only the geometry storage differs. glTF-Transform effectively performs a “copy” operation that triggers decompression, which is exactly how its CLI gltf-transform cp works to remove Draco ￼.

Below is a JavaScript implementation following these steps:

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
await removeDracoCompression('model_draco.glb', 'model_decompressed.glb');
console.log('Draco compression removed successfully.');

How this works: When io.read() loads a model that has Draco-compressed meshes, the KHRDracoMeshCompression extension (registered above) kicks in. It uses the provided draco3d.decoder module to decode each compressed mesh into standard vertex attributes ￼. After reading, the in-memory doc contains the full geometry data (positions, normals, UVs, etc.) as regular arrays. Calling io.write() then writes out a glTF/GLB that does not include the Draco extension at all – it’s as if the model was originally exported uncompressed. In fact, the glTF-Transform CLI will log a warning when doing this copy, noting that it “decompresses the file” ￼.

Efficiency: This approach is efficient and robust. The Draco decoder is written in C++ and compiled to WebAssembly, so decoding is fast. The glTF-Transform library takes care of all JSON and binary handling, so you don’t have to manually manipulate buffers. The memory overhead is low (it streams data as needed), and the output is optimized – unnecessary Draco extension data is gone, and only the essential geometry arrays remain. The entire process is typically a one-time conversion (since Draco is lossy, you wouldn’t recompress and decompress repeatedly ￼).

Alternative: Using Three.js to Decode and Re-Export

If, for some reason, you prefer not to add another library and you’re already using Three.js, you can use Three’s loaders/exporters to achieve a similar result:
	•	Load with GLTFLoader + DRACOLoader: Three.js’s GLTFLoader can load Draco-compressed models if you attach a DRACOLoader (which uses Draco decoder internally). This will give you a Three.js scene or mesh object with all geometry fully decoded in memory.
	•	Export with GLTFExporter: Once loaded, use Three’s GLTFExporter to export the scene or object back to a glTF/GLB file. The exporter will output the geometry as-is (it does not re-compress it). The result is an uncompressed glTF containing the same meshes, animations, materials, etc. ￼.

Note: This method will preserve the model’s structure and animations (Three.js exporter supports nodes, skinned meshes, morph targets, animations, materials, etc.). However, using Three.js in a Node script can be heavy. There are projects that adapt Three.js for Node (e.g. node-three-gltf which packages GLTFLoader/DRACOLoader/GLTFExporter for Node use ￼), but if your goal is a lightweight standalone script, pulling in a full 3D engine is usually unnecessary. In contrast, glTF-Transform and Draco decoder together are much smaller and purpose-built for this kind of processing ￼.

Ensuring the Output is Optimized and Three.js-Compatible

By following the above methods, the output model will be a standard glTF 2.0 asset without exotic dependencies – fully compatible with Three.js (or any glTF viewer) out of the box. To double-check quality and compatibility:
	•	No Draco Extension: Verify that the extensionsUsed and extensionsRequired in the glTF do not list KHR_draco_mesh_compression. The glTF JSON should instead directly reference buffer views for mesh attributes (positions, normals, etc.). Tools like glTF-Transform handle this automatically.
	•	File Size vs. Performance Trade-off: Expect a larger file size. For example, a Draco-compressed model of 10MB might inflate to 50MB+ when uncompressed (depending on geometry complexity). This is normal – you’ve traded file size for simplicity. If needed, you can apply lossless compression techniques like mesh quantization (KHR_mesh_quantization) to reduce size without requiring a custom decoder (Three.js supports this extension natively). This is optional but can be done via glTF-Transform as well.
	•	Preserved Visuals: All visual aspects (textures, materials, animations) should look the same. Animations will target the same nodes, and materials will reference the same textures. Removing Draco only affects how geometry data is stored, not how it appears.
	•	One-Time Process: As a best practice, perform Draco decompression as an offline step (perhaps in a build pipeline or before deployment). Since Draco is lossy, keep your original source model (or ensure you don’t re-compress the already compressed data). Decompressing once and using the result going forward is fine ￼.

Conclusion

In summary, the widely accepted approach to remove Draco compression is to decode with the official Draco library and use a glTF-aware tool to rewrite the file. glTF-Transform offers a streamlined way to do this in a Node.js script, preserving all mesh attributes, animations, skins, and materials of your model. The resulting glTF/GLB is larger in size but straightforward for any engine (including Three.js) to load without special decoders or extensions. By following these practices – using proven libraries, preserving all data, and optimizing the output format – you’ll get an efficient, decompressed model ready for seamless rendering in Three.js.

References:
	•	Don McCurdy, “gltf-transform cp … will show a warning that this decompresses the file.” – glTF forum ￼
	•	glTF-Transform Documentation – Draco decoder must be provided for reading/writing Draco-compressed files ￼
	•	Stack Overflow (Don McCurdy) – Using draco3d with glTF-Transform to process Draco in a full glTF scene ￼
	•	gltf-undracofy (open-source tool) – Uses glTF-Transform + Draco to remove Draco compression ￼
	•	Three.js Forum – Suggestion to use Three.js (editor) as an option to decompress Draco ￼ (noting Draco is lossy)
	•	Node-three-gltf Project – Demonstrates GLTFLoader+DRACOLoader and GLTFExporter working in Node.js ￼, confirming Three.js approach for completeness.
