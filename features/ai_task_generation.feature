@javascript
Feature: AI Task Generation
  As a team lead
  I want to use AI to help me generate task details
  So that I can create tasks more quickly and accurately

  Background:
    Given the following team exists:
      | name      | description |
      | Tech Team | Core developers |
    And the following user exists:
      | name      | email             | password | role      | team      |
      | Alice     | alice@example.com | password | team_lead | Tech Team |
    And I am logged in as "alice@example.com" with password "password"

  Scenario: Successfully generating a task with AI
    When I open the task creation dialog
    And I enter "Implement a React search bar with Material UI" into the AI prompt
    And I click the "Magic Wand" icon
    Then the description should contain "Implement a React search bar"
    And the points should be a positive integer
    And the due date should be set to a future date
