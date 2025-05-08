const { Given, When, Then } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const RecipeImporter = require('../../src/recipeImporter');
const RecipeExporter = require('../../src/recipeExporter');

let markdownContent;
let tempFilePath;
let recipeImporter;
let recipeExporter;
let importedRecipe;
let exportedFilePath;
let tempDir;
let recipesDir;
let outputDir;

Given('I have a recipe in a Markdown file', function () {
    markdownContent = `# Chocolate Chip Cookies
    
## Ingredients
- 2 cups flour
- 1 cup sugar
- 2 eggs
- 1 cup chocolate chips

## Instructions
1. Mix dry ingredients
2. Add wet ingredients
3. Bake at 350°F for 12 minutes`;
    
    // Create a temporary markdown file
    tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    tempFilePath = path.join(tempDir, 'recipe.md');
    fs.writeFileSync(tempFilePath, markdownContent);
    
    recipeImporter = new RecipeImporter();
    recipeExporter = new RecipeExporter();
});

Given('I have a folder containing multiple recipe Markdown files', function () {
    const recipes = [
        {
            name: 'chocolate-chip-cookies.md',
            content: `# Chocolate Chip Cookies
            
## Ingredients
- 2 cups flour
- 1 cup sugar
- 2 eggs
- 1 cup chocolate chips

## Instructions
1. Mix dry ingredients
2. Add wet ingredients
3. Bake at 350°F for 12 minutes`
        },
        {
            name: 'banana-bread.md',
            content: `# Banana Bread
            
## Ingredients
- 3 ripe bananas
- 1/3 cup butter
- 1 cup sugar
- 1 egg
- 1 tsp baking soda

## Instructions
1. Mash bananas
2. Mix all ingredients
3. Bake at 350°F for 60 minutes`
        }
    ];
    
    // Create recipes directory
    tempDir = path.join(__dirname, '../../temp');
    recipesDir = path.join(tempDir, 'recipes');
    if (!fs.existsSync(recipesDir)) {
        fs.mkdirSync(recipesDir, { recursive: true });
    }
    
    // Create recipe files
    recipes.forEach(recipe => {
        fs.writeFileSync(path.join(recipesDir, recipe.name), recipe.content);
    });
    
    recipeImporter = new RecipeImporter();
    recipeExporter = new RecipeExporter();
});

When('I process the recipe', async function () {
    // First import the recipe
    importedRecipe = await recipeImporter.importRecipe(tempFilePath);
    
    // Then export it to HTML
    exportedFilePath = path.join(path.dirname(tempFilePath), 'recipe.html');
    await recipeExporter.exportToHtml(importedRecipe, exportedFilePath);
});

When('I process the folder', async function () {
    // Create output directory
    outputDir = path.join(tempDir, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    // Import all recipes
    const files = fs.readdirSync(recipesDir);
    const recipes = await Promise.all(
        files.map(file => recipeImporter.importRecipe(path.join(recipesDir, file)))
    );
    
    // Export to multi-page site
    exportedFilePath = await recipeExporter.exportToMultiPageSite(recipes, outputDir);
});

Then('I should receive an HTML page with the recipe', async function () {
    assert.ok(fs.existsSync(exportedFilePath), 'HTML file was not created');
    
    const content = await fs.promises.readFile(exportedFilePath, 'utf-8');
    
    // Check for basic HTML structure
    assert.ok(content.includes('<!DOCTYPE html>'), 'Missing DOCTYPE declaration');
    assert.ok(content.includes('<html'), 'Missing HTML tag');
    assert.ok(content.includes('</html>'), 'Missing closing HTML tag');
    
    // Check for recipe content
    assert.ok(content.includes(`<title>${importedRecipe.title}</title>`), 'Missing recipe title in head');
    assert.ok(content.includes(`<h1>${importedRecipe.title}</h1>`), 'Missing recipe title in body');
    
    // Check for ingredients
    assert.ok(content.includes('<h2>Ingredients</h2>'), 'Missing ingredients section');
    importedRecipe.ingredients.forEach(ingredient => {
        assert.ok(content.includes(`<li>${ingredient}</li>`), `Missing ingredient: ${ingredient}`);
    });
    
    // Check for instructions
    assert.ok(content.includes('<h2>Instructions</h2>'), 'Missing instructions section');
    importedRecipe.instructions.forEach(instruction => {
        assert.ok(content.includes(`<li>${instruction}</li>`), `Missing instruction: ${instruction}`);
    });
});

Then('I should receive a multi-page HTML site with all the recipes', async function () {
    // Check that index.html exists
    const indexPath = path.join(outputDir, 'index.html');
    assert.ok(fs.existsSync(indexPath), 'Index file was not created');
    
    // Read index content
    const indexContent = await fs.promises.readFile(indexPath, 'utf-8');
    
    // Check for basic HTML structure
    assert.ok(indexContent.includes('<!DOCTYPE html>'), 'Missing DOCTYPE declaration');
    assert.ok(indexContent.includes('<html'), 'Missing HTML tag');
    assert.ok(indexContent.includes('</html>'), 'Missing closing HTML tag');
    
    // Check for recipe links
    assert.ok(indexContent.includes('Chocolate Chip Cookies'), 'Missing Chocolate Chip Cookies link');
    assert.ok(indexContent.includes('Banana Bread'), 'Missing Banana Bread link');
    
    // Check individual recipe pages
    const recipeFiles = ['chocolate-chip-cookies.html', 'banana-bread.html'];
    for (const file of recipeFiles) {
        const filePath = path.join(outputDir, file);
        assert.ok(fs.existsSync(filePath), `Recipe file ${file} was not created`);
        
        const content = await fs.promises.readFile(filePath, 'utf-8');
        assert.ok(content.includes('<!DOCTYPE html>'), `Missing DOCTYPE declaration in ${file}`);
        assert.ok(content.includes('<html'), `Missing HTML tag in ${file}`);
        assert.ok(content.includes('</html>'), `Missing closing HTML tag in ${file}`);
        assert.ok(content.includes('Back to Recipes'), `Missing back link in ${file}`);
    }
}); 