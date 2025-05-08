const fs = require('fs');
const path = require('path');

class RecipeImporter {
    constructor() {
        this.recipeCache = new Map();
    }

    /**
     * Imports a recipe from a Markdown file
     * @param {string} filePath - Path to the Markdown file
     * @returns {Object|Array} The parsed recipe(s)
     */
    async importRecipe(filePath) {
        try {
            console.log(`\nProcessing file: ${filePath}`);
            const content = await fs.promises.readFile(filePath, 'utf-8');
            console.log('File content length:', content.length);
            
            const recipes = this.parseRecipe(content);
            console.log('Parsed recipes:', recipes);
            
            const fileName = path.basename(filePath, '.md');
            console.log('Filename:', fileName);
            
            // If we got a single recipe, add the path and title if needed
            if (!Array.isArray(recipes)) {
                console.log('Processing single recipe');
                // Store the full relative path including directories
                recipes.path = path.relative(process.cwd(), filePath);
                if (!recipes.title) {
                    console.log('No title found, using filename');
                    recipes.title = this.formatTitleFromFilename(fileName);
                }
                console.log('Final recipe:', recipes);
                return recipes;
            }
            
            // If we got multiple recipes, add the path to each one and title if needed
            console.log('Processing multiple recipes');
            const processedRecipes = recipes.map(recipe => {
                // Store the full relative path including directories
                recipe.path = path.relative(process.cwd(), filePath);
                if (!recipe.title) {
                    console.log('No title found for recipe, using filename');
                    recipe.title = this.formatTitleFromFilename(fileName);
                }
                return recipe;
            });
            console.log('Final recipes:', processedRecipes);
            return processedRecipes;
        } catch (error) {
            console.error(`Error in importRecipe for ${filePath}:`, error);
            throw new Error(`Failed to import recipe: ${error.message}`);
        }
    }

    /**
     * Formats a filename into a title
     * @param {string} filename - The filename without extension
     * @returns {string} The formatted title
     */
    formatTitleFromFilename(filename) {
        return filename
            // Replace hyphens and underscores with spaces
            .replace(/[-_]/g, ' ')
            // Capitalize first letter of each word
            .replace(/\b\w/g, l => l.toUpperCase())
            // Trim any extra spaces
            .trim();
    }

    /**
     * Imports all recipes from a directory and its subdirectories
     * @param {string} dirPath - Path to the directory containing recipes
     * @returns {Promise<Array<Object>>} Array of parsed recipes
     */
    async importRecipesFromDirectory(dirPath) {
        const recipes = [];
        console.log(`\nScanning directory: ${dirPath}`);
        const files = await this.getAllMarkdownFiles(dirPath);
        console.log(`Found ${files.length} markdown files:`, files);
        
        for (const file of files) {
            try {
                const result = await this.importRecipe(file);
                if (Array.isArray(result)) {
                    recipes.push(...result);
                } else {
                    recipes.push(result);
                }
            } catch (error) {
                console.log(`Error processing file: ${file}`);
                console.warn(`Warning: Failed to import ${file}: ${error.message}`);
            }
        }

        console.log(`\nTotal recipes found: ${recipes.length}`);
        return recipes;
    }

    /**
     * Gets all markdown files in a directory and its subdirectories
     * @param {string} dirPath - Path to the directory
     * @returns {Promise<Array<string>>} Array of file paths
     */
    async getAllMarkdownFiles(dirPath) {
        const files = [];
        
        async function scanDirectory(dir) {
            console.log(`Scanning subdirectory: ${dir}`);
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    console.log(`Found subdirectory: ${fullPath}`);
                    await scanDirectory(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    console.log(`Found markdown file: ${fullPath}`);
                    files.push(fullPath);
                }
            }
        }

        await scanDirectory(dirPath);
        return files;
    }

    /**
     * Parses a recipe from Markdown content
     * @param {string} content - The Markdown content
     * @returns {Object|Array} The parsed recipe(s)
     */
    parseRecipe(content) {
        const lines = content.split('\n');
        let currentSection = '';
        let currentRecipe = {
            title: '',
            ingredients: [],
            steps: []
        };
        const recipes = [];

        for (const line of lines) {
            // Start a new recipe when we encounter a top-level heading
            if (line.startsWith('# ')) {
                // If we have a previous recipe with content, add it to the list
                if (currentRecipe.ingredients.length > 0 || currentRecipe.steps.length > 0) {
                    recipes.push(currentRecipe);
                }
                
                // Start a new recipe
                currentRecipe = {
                    title: line.substring(2).trim(),
                    ingredients: [],
                    steps: []
                };
                currentSection = '';
                continue;
            }

            // Parse section headers
            if (line.startsWith('## ')) {
                currentSection = line.substring(3).toLowerCase().trim();
                continue;
            }

            // Parse ingredients
            if (currentSection === 'ingredients' && line.trim().startsWith('- ')) {
                currentRecipe.ingredients.push(line.trim().substring(2));
            }

            // Parse steps
            if (currentSection === 'steps' && /^\d+\.\s/.test(line.trim())) {
                currentRecipe.steps.push(line.trim().replace(/^\d+\.\s/, ''));
            }
        }

        // Add the last recipe if it has content
        if (currentRecipe.ingredients.length > 0 || currentRecipe.steps.length > 0) {
            recipes.push(currentRecipe);
        }

        // Return a single recipe if there's only one, otherwise return the array
        return recipes.length === 1 ? recipes[0] : recipes;
    }
}

module.exports = RecipeImporter; 