const { Given, When, Then } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const RecipeExporter = require('../../src/recipeExporter');

let recipe;
let exportedFilePath;
let recipeExporter;

Given('I have a recipe', function () {
    recipe = {
        title: 'Chocolate Chip Cookies',
        ingredients: [
            '2 cups flour',
            '1 cup sugar',
            '2 eggs',
            '1 cup chocolate chips'
        ],
        instructions: [
            'Mix dry ingredients',
            'Add wet ingredients',
            'Bake at 350°F for 12 minutes'
        ]
    };
    
    recipeExporter = new RecipeExporter();
});

When('I export the recipe to an HTML file', async function () {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    exportedFilePath = path.join(tempDir, 'recipe.html');
    await recipeExporter.exportToHtml(recipe, exportedFilePath);
});

Then('I should receive an HTML file with the recipe', async function () {
    assert.ok(fs.existsSync(exportedFilePath), 'HTML file was not created');
    
    const content = await fs.promises.readFile(exportedFilePath, 'utf-8');
    
    // Check for basic HTML structure
    assert.ok(content.includes('<!DOCTYPE html>'), 'Missing DOCTYPE declaration');
    assert.ok(content.includes('<html'), 'Missing HTML tag');
    assert.ok(content.includes('</html>'), 'Missing closing HTML tag');
    
    // Check for recipe content
    assert.ok(content.includes(`<title>${recipe.title}</title>`), 'Missing recipe title in head');
    assert.ok(content.includes(`<h1>${recipe.title}</h1>`), 'Missing recipe title in body');
    
    // Check for ingredients
    assert.ok(content.includes('<h2>Ingredients</h2>'), 'Missing ingredients section');
    recipe.ingredients.forEach(ingredient => {
        assert.ok(content.includes(`<li>${ingredient}</li>`), `Missing ingredient: ${ingredient}`);
    });
    
    // Check for instructions
    assert.ok(content.includes('<h2>Instructions</h2>'), 'Missing instructions section');
    recipe.instructions.forEach(instruction => {
        assert.ok(content.includes(`<li>${instruction}</li>`), `Missing instruction: ${instruction}`);
    });
}); 