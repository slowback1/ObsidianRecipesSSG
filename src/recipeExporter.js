const fs = require('fs');
const path = require('path');

class RecipeExporter {
    /**
     * Exports a recipe to an HTML file
     * @param {Object} recipe - The recipe to export
     * @param {string} outputPath - Path where the HTML file should be saved
     * @returns {Promise<string>} The path to the exported HTML file
     */
    async exportToHtml(recipe, outputPath) {
        const html = this.generateHtml(recipe);
        await fs.promises.writeFile(outputPath, html, 'utf-8');
        return outputPath;
    }

    /**
     * Exports multiple recipes to a multi-page HTML site
     * @param {Array<Object>} recipes - Array of recipes to export
     * @param {string} outputDir - Directory where the HTML files should be saved
     * @returns {Promise<string>} The path to the index file
     */
    async exportToMultiPageSite(recipes, outputDir) {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Export individual recipe pages
        const recipePages = await Promise.all(recipes.map(async (recipe) => {
            // Get just the filename without extension
            const fileName = path.basename(recipe.path, '.md');
            
            // Generate filename from the recipe title
            const outputFileName = this.generateFileName(fileName);
            
            // Create the output path in the output directory
            const filePath = path.join(outputDir, outputFileName);
            await this.exportToHtml(recipe, filePath);
            
            // Return the relative path for the index page
            return {
                title: recipe.title,
                path: outputFileName // Just use the filename since it's in the root output directory
            };
        }));

        // Generate and save index page
        const indexPath = path.join(outputDir, 'index.html');
        const indexHtml = this.generateIndexHtml(recipePages);
        await fs.promises.writeFile(indexPath, indexHtml, 'utf-8');

        return indexPath;
    }

    /**
     * Generates a filename from a recipe name
     * @param {string} name - The recipe name
     * @returns {string} The generated filename
     */
    generateFileName(name) {
        return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    }

    /**
     * Generates HTML content for a recipe
     * @param {Object} recipe - The recipe to convert to HTML
     * @returns {string} The HTML content
     */
    generateHtml(recipe) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${recipe.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        ul, ol {
            padding-left: 20px;
        }
        li {
            margin: 8px 0;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #3498db;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <a href="index.html" class="back-link">← Back to Recipes</a>
    <h1>${recipe.title}</h1>
    
    <h2>Ingredients</h2>
    <ul>
        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('\n        ')}
    </ul>

    <h2>Steps</h2>
    <ol>
        ${recipe.steps.map(step => `<li>${step}</li>`).join('\n        ')}
    </ol>
</body>
</html>`;
    }

    /**
     * Generates HTML content for the index page
     * @param {Array<Object>} recipes - Array of recipe objects with title and path
     * @returns {string} The HTML content for the index page
     */
    generateIndexHtml(recipes) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recipe Collection</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .search-container {
            margin: 20px 0;
        }
        .search-input {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        .search-input:focus {
            outline: none;
            border-color: #3498db;
        }
        .recipe-list {
            list-style: none;
            padding: 0;
        }
        .recipe-item {
            margin: 15px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            transition: background-color 0.2s;
        }
        .recipe-item:hover {
            background-color: #e9ecef;
        }
        .recipe-link {
            color: #2c3e50;
            text-decoration: none;
            font-size: 1.2em;
            font-weight: bold;
        }
        .recipe-link:hover {
            color: #3498db;
        }
        .no-results {
            text-align: center;
            color: #666;
            padding: 20px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <h1>Recipe Collection</h1>
    <div class="search-container">
        <input type="text" class="search-input" placeholder="Search recipes..." id="searchInput">
    </div>
    <ul class="recipe-list" id="recipeList">
        ${recipes.map(recipe => `
        <li class="recipe-item">
            <a href="${recipe.path}" class="recipe-link">${recipe.title}</a>
        </li>`).join('\n        ')}
    </ul>
    <div class="no-results" id="noResults" style="display: none;">
        No recipes found matching your search.
    </div>

    <script>
        const searchInput = document.getElementById('searchInput');
        const recipeList = document.getElementById('recipeList');
        const noResults = document.getElementById('noResults');
        const recipeItems = recipeList.getElementsByClassName('recipe-item');

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let hasResults = false;

            Array.from(recipeItems).forEach(item => {
                const recipeTitle = item.querySelector('.recipe-link').textContent.toLowerCase();
                if (recipeTitle.includes(searchTerm)) {
                    item.style.display = '';
                    hasResults = true;
                } else {
                    item.style.display = 'none';
                }
            });

            noResults.style.display = hasResults ? 'none' : 'block';
        });
    </script>
</body>
</html>`;
    }
}

module.exports = RecipeExporter; 