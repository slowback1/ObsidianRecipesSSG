Feature: Importing and Exporting Recipes

Scenario: Import and export a recipe
    Given I have a recipe in a Markdown file
    When I process the recipe
    Then I should receive an HTML page with the recipe

Scenario: Import and export a folder of recipes as a multi-page site
    Given I have a folder containing multiple recipe Markdown files
    When I process the folder
    Then I should receive a multi-page HTML site with all the recipes
