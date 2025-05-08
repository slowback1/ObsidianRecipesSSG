const { AfterAll } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

AfterAll(async function() {
    const tempDir = path.join(__dirname, '../../temp');
    if (fs.existsSync(tempDir)) {
        // Recursively remove the temp directory and all its contents
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}); 