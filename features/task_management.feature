@javascript
Feature: Task Management
  As a team member
  I want to create, take, and progress tasks
  So that I can contribute to my team's project

  Background:
    Given a team exists named "Dev Team"
    And a user exists with email "member@example.com" and password "password123"

  Scenario: Team Lead creates a task manually
    Given I am logged in as a team lead
    And I open the side menu
    When I click the "Create Task" menu item
    And I fill in "title" with "New Feature Implementation"
    And I fill in "description" with "Detailed description of the feature"
    And I fill in "points" with "5"
    And I fill in "due_date" with "2026-05-08"
    And I click the "CONFIRM" button
    Then I should see the text "Task created successfully"
    And the task "New Feature Implementation" should be in the "Unassigned" section

  Scenario: Team Lead assigns a task directly to a member
    Given I am logged in as a team lead
    And a task exists with title "Urgent Fixes" and state "UNASSIGNED"
    And I refresh the page
    When I click on the task with title "Urgent Fixes"
    And I click the "PATCH" button
    And I select "member@example.com" from the "Assignee" dropdown
    And I click the "CONFIRM" button
    Then I should see the text "Task updated successfully"
    And I click on the task with title "Urgent Fixes"
    Then I should see the text "Member User"

  Scenario: User takes an unassigned task
    Given I am logged in as a normal team member
    And a task exists with title "Simple Bug" and state "UNASSIGNED"
    And I refresh the page
    When I click on the task with title "Simple Bug"
    And I click the "Take" button
    Then I should see the text "Task taken successfully"
    And the task "Simple Bug" should be in the "Assigned" section

  Scenario: Member lacking skills cannot take a task
    Given I am logged in as a normal team member
    And a task exists with title "Expert Backend Task" and state "UNASSIGNED" and skills "rust,docker"
    And I refresh the page
    When I click on the task with title "Expert Backend Task"
    And I click the "Take" button
    Then I should see the text "missing required skills"
    And the task "Expert Backend Task" should be in the "Unassigned" section

  Scenario: Task transition requires Lead approval
    Given I am logged in as a normal team member
    And a task exists with title "Review Me" and state "ASSIGNED" and needs validation
    And I refresh the page
    When I click on the task with title "Review Me"
    And I click the "PROGRESS" button
    Then I should see the text "Transition is pending team lead approval"
    And I log out
    Given I am logged in as a team lead
    # Assuming there's an approvals page or similar link
    When I click the "Manage Approvals" menu item
    Then I should see the text "Review Me"
    When I approve the pending transition for "Review Me"
    Then I should see the text "Approved successfully"
    And the task "Review Me" should be in the "Completed" section
