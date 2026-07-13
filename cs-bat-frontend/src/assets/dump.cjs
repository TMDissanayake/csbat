const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, 'cricket_batsports.glb');
const buffer = fs.readFileSync(glbPath);

// GLB Header
const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);

// Chunk 0 (JSON)
const chunk0Length = buffer.readUInt32LE(12);
const chunk0Type = buffer.toString('utf8', 16, 20);

if (magic === 'glTF' && chunk0Type === 'JSON') {
  const jsonString = buffer.toString('utf8', 20, 20 + chunk0Length);
  const json = JSON.parse(jsonString);
  
  console.log("Nodes:", json.nodes ? json.nodes.map(n => n.name).filter(Boolean) : []);
  console.log("Materials:", json.materials ? json.materials.map(m => m.name).filter(Boolean) : []);
} else {
  console.log("Not a valid GLB or missing JSON chunk");
}
