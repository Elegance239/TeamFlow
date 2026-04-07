@javascript
Feature: Task Management
  As a team member
  I want to create, take, and progress tasks
  So that I can contribute to my team's project

  Scenario: Admin creates a task and User takes it
    Given I am logged in as a team lead
    And I open the drawer
    When I click the "Create Task" link
    And I fill in "description" with "Finish UI Design"
    And I fill in "points" with "5"
    And I click the "CONFIRM" button
    Then I should see the text "Task created successfully"
    And I log out

    #users
    When I log in with email "member@example.com" and password "password123"
    And I click on the task with description "Finish UI Design"
    And I click the "Take" button
    Then I should see the text "Task taken successfully"
    
    When I click on the task with description "Finish UI Design"
    And I click the "PROGRESS" button
    Then I should see the text "Task progressed successfully"
