const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update a single file
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check if file contains axios.get or axios.post calls
    if (content.includes('axios.get') || content.includes('axios.post') || content.includes('axios.put') || content.includes('axios.delete')) {
      console.log(`Updating: ${filePath}`);
      
      // Replace axios import with api import
      if (content.includes("import axios from 'axios';")) {
        content = content.replace("import axios from 'axios';", "import api from '../utils/api';");
        updated = true;
      }
      
      // Replace axios.get with api.get
      content = content.replace(/axios\.get/g, 'api.get');
      content = content.replace(/axios\.post/g, 'api.post');
      content = content.replace(/axios\.put/g, 'api.put');
      content = content.replace(/axios\.delete/g, 'api.delete');
      
      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔄 Starting API import updates...\n');

const frontendDir = path.join(__dirname, 'frontend', 'src');
const jsFiles = findJsFiles(frontendDir);

console.log(`Found ${jsFiles.length} JavaScript files to check...\n`);

jsFiles.forEach(file => {
  updateFile(file);
});

console.log('\n✅ API import update completed!');
console.log('\n📋 Next steps:');
console.log('1. Add REACT_APP_API_URL environment variable in Render frontend');
console.log('2. Set value to: https://multivendor-ecommerce-shop-030g.onrender.com');
console.log('3. Redeploy frontend');
console.log('4. Test API calls');
