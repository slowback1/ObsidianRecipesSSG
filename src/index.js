#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const RecipeImporter = require('./recipeImporter');
const RecipeExporter = require('./recipeExporter');

async function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: recipe-ssg <input-directory> <output-directory>');
        process.exit(1);
    }

    const [inputDir, outputDir] = args.map(dir => path.resolve(dir));

    // Validate input directory
    if (!fs.existsSync(inputDir)) {
        console.error(`Error: Input directory "${inputDir}" does not exist`);
        process.exit(1);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        // Initialize importer and exporter
        const importer = new RecipeImporter();
        const exporter = new RecipeExporter();

        // Import all recipes from directory and subdirectories
        console.log(`Scanning for recipes in ${inputDir}...`);
        const recipes = await importer.importRecipesFromDirectory(inputDir);

        if (recipes.length === 0) {
            console.error(`Error: No markdown files found in "${inputDir}"`);
            process.exit(1);
        }

        console.log(`Found ${recipes.length} recipe(s) to process...`);

        // Export to multi-page site
        const indexPath = await exporter.exportToMultiPageSite(recipes, outputDir);
        
        console.log(`Successfully generated site at: ${outputDir}`);
        console.log(`Index page: ${path.relative(process.cwd(), indexPath)}`);
        console.log(`Generated ${recipes.length} recipe pages`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 