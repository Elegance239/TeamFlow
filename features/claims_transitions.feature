@javascript
Feature: Task Management
  As a team member
  I want to create, take, and progress tasks
  So that I can contribute to my team's project
  
  Background:
    Given a team exists named "Dev Team"
    And a user exists with email "member@example.com" and password "password123"

  Scenario: Member lacking skills cannot take a task
    Given I am logged in as a normal team member
    And a task exists with title "Expert Backend Task" and state "UNASSIGNED" and skills "rust,docker"
    And I refresh the page
    When I click on the task with description "Skill test task"
    And I click the "Take" button
    Then I should see the text "missing required skills"
    And the task "Expert Backend Task" should be in the "Unassigned" section