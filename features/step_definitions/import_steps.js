const { Given, When, Then } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const RecipeImporter = require('../../src/recipeImporter');

let markdownContent;
let importedPage;
let recipeImporter;
let tempFilePath;

Given('I have a Markdown file which contains a recipe', function () {
    markdownContent = `# Delicious Recipe
    
## Ingredients
- 2 cups flour
- 1 cup sugar
- 2 eggs

## Steps
1. Mix ingredients
2. Bake at 350°F for 30 minutes`;
    
    // Create a temporary markdown file
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    tempFilePath = path.join(tempDir, 'recipe.md');
    fs.writeFileSync(tempFilePath, markdownContent);
    
    recipeImporter = new RecipeImporter();
});

Given('I have a Markdown file which contains multiple recipes', function () {
    markdownContent = `# Chocolate Chip Cookies
    
## Ingredients
- 2 cups flour
- 1 cup sugar
- 2 eggs
- 1 cup chocolate chips

## Steps
1. Mix dry ingredients
2. Add wet ingredients
3. Bake at 350°F for 12 minutes

# Banana Bread

## Ingredients
- 3 ripe bananas
- 1/3 cup butter
- 1 cup sugar
- 1 egg
- 1 tsp baking soda

## Steps
1. Mash bananas
2. Mix all ingredients
3. Bake at 350°F for 60 minutes`;
    
    // Create a temporary markdown file
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    tempFilePath = path.join(tempDir, 'recipes.md');
    fs.writeFileSync(tempFilePath, markdownContent);
    
    recipeImporter = new RecipeImporter();
});

Given('I have a Markdown file which contains a recipe with H1 title', function () {
    markdownContent = `## Ingredients
- 2 cups flour
- 1 cup sugar
- 2 eggs

## Steps
1. Mix ingredients
2. Bake at 350°F for 30 minutes`;
    
    // Create a temporary markdown file
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    tempFilePath = path.join(tempDir, 'chocolate-cake.md');
    fs.writeFileSync(tempFilePath, markdownContent);
    
    recipeImporter = new RecipeImporter();
});

When('I import the Markdown file', async function () {
    importedPage = await recipeImporter.importRecipe(tempFilePath);
});

Then('I should receive a page with the recipe', function () {
    assert.ok(importedPage, 'No page was imported');
    assert.deepEqual(importedPage.ingredients, ['2 cups flour', '1 cup sugar', '2 eggs'], 'Ingredients do not match');
    assert.deepEqual(importedPage.steps, ['Mix ingredients', 'Bake at 350°F for 30 minutes'], 'Steps do not match');
});

Then('I should receive multiple pages with the recipes', function () {
    assert.ok(Array.isArray(importedPage), 'Expected an array of recipes');
    assert.equal(importedPage.length, 2, 'Expected 2 recipes');

    // Check first recipe (Chocolate Chip Cookies)
    const cookies = importedPage[0];
    assert.equal(cookies.title, 'Chocolate Chip Cookies', 'First recipe title does not match');
    assert.deepEqual(cookies.ingredients, [
        '2 cups flour',
        '1 cup sugar',
        '2 eggs',
        '1 cup chocolate chips'
    ], 'First recipe ingredients do not match');
    assert.deepEqual(cookies.steps, [
        'Mix dry ingredients',
        'Add wet ingredients',
        'Bake at 350°F for 12 minutes'
    ], 'First recipe steps do not match');

    // Check second recipe (Banana Bread)
    const bread = importedPage[1];
    assert.equal(bread.title, 'Banana Bread', 'Second recipe title does not match');
    assert.deepEqual(bread.ingredients, [
        '3 ripe bananas',
        '1/3 cup butter',
        '1 cup sugar',
        '1 egg',
        '1 tsp baking soda'
    ], 'Second recipe ingredients do not match');
    assert.deepEqual(bread.steps, [
        'Mash bananas',
        'Mix all ingredients',
        'Bake at 350°F for 60 minutes'
    ], 'Second recipe steps do not match');
});

Then('the page should use the file name as the title', function () {
    assert.equal(importedPage.title, 'Chocolate Cake');
}); 