Feature: Export

  Scenario: Export a recipe to an HTML file
    Given I have a recipe
    When I export the recipe to an HTML file
    Then I should receive an HTML file with the recipe