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
    And I fill in "due_date" with "2026-05-08"
    And I click the "CONFIRM" button
    Then I should see the text "Task created successfully"
    And I log out

    Given a user exists with email "member@example.com" and password "password123"
    When I log in with email "member@example.com" and password "password123"
    And I refresh the page
    And I click on the task with description "Finish UI Design"
    And I click the "Take" button
    Then I should see the text "Task taken successfully"
    When I refresh the page
    Then I click on the task with description "Finish UI Design"
    And I click the "PROGRESS" button
    Then I should see the text "Task progressed successfully"
  
  Scenario: User unclaims a task
    Given I am logged in as a normal team member
    And a task exists with description "Fix bug" and state "ASSIGNED" assigned to me
    And I refresh the page
    When I click on the task with description "Fix bug"
    And I click the "Unclaim" button
    Then I should see the text "Task unclaimed successfully"
    And the task "Fix bug" should be in the "Unassigned" section

  Scenario: Team Lead deletes a task
    Given I am logged in as a team lead
    And a task exists with description "Old Task" and state "UNASSIGNED"
    And I refresh the page
    When I click on the task with description "Old Task"
    And I click the "DELETE" button
    And I click the "CONFIRM" button
    Then I should see the text "Task deleted successfully"
    And I should not see the text "Old Task"
