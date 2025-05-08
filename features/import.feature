Feature: Import

  Scenario: Import a Markdown file
    Given I have a Markdown file which contains a recipe
    When I import the Markdown file
    Then I should receive a page with the recipe

  Scenario: Import a Markdown file with multiple recipes
    Given I have a Markdown file which contains multiple recipes
    When I import the Markdown file
    Then I should receive multiple pages with the recipes

  Scenario: Import a recipe with no title
    Given I have a Markdown file which contains a recipe with H1 title
    When I import the Markdown file
    Then the page should use the file name as the title
