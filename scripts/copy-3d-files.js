#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const root = process.cwd();

// Function to recursively get all files in a directory
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      // Get path relative to workspace root
      const relativePath = path.relative(root, fullPath);
      arrayOfFiles.push(relativePath);
    }
  });

  return arrayOfFiles;
};

const copyToClipboard = (text) => {
  // Create a temporary file
  const tempFile = path.join(root, '.temp-clipboard');
  fs.writeFileSync(tempFile, text);

  // Use pbcopy on macOS to copy to clipboard
  exec(`cat "${tempFile}" | pbcopy`, (error) => {
    if (error) {
      console.error('Failed to copy to clipboard:', error);
    } else {
      console.log('Successfully copied to clipboard!');
    }
    // Clean up temp file
    fs.unlinkSync(tempFile);
  });
};

const formatFiles = async () => {
  try {
    let output = '';

    // Always include these specific files
    const specificFiles = [
      'app/index.tsx'
    ];

    // Get all files from engine/ recursively
    const engineFiles = getAllFiles(path.join(root, 'engine'));

    // Combine all files to process
    const filesToCopy = [...specificFiles, ...threeDFiles, ...engineFiles];

    for (const filePath of filesToCopy) {
      const fullPath = path.join(root, filePath);

      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        output += `${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        console.log(`✅ Added ${filePath}`);
      } else {
        console.log(`❌ File not found: ${filePath}`);
      }
    }

    copyToClipboard(output);

    console.log('\n✨ Process complete! The formatted content has been copied to your clipboard.');
    console.log('The copied text includes:');
    filesToCopy.forEach(file => console.log(`- ${file}`));

  } catch (error) {
    console.error(`Error during script execution: ${error}`);
  }
};

formatFiles();
