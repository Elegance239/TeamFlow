@javascript
Feature: Team Management
  As a user
  I want to create or join a team
  So that I can collaborate with my colleagues

  Scenario: Admin creates a new team
    Given I am on the signup page
    When I fill in "Display Name" with "Admin User"
    And I fill in "Email" with "admin@example.com"
    And I fill in "Password" with "password123"
    And I fill in "Confirm Password" with "password123"
    And I choose "Admin" from "Register as"
    And I choose "Create new department"
    And I fill in "Department Name" with "Logistics Team"
    And I click the "Sign Up" button
    And I refresh the page
    And I open the drawer
    Then I should see "Logistics Team" as the team name in the drawer

  Scenario: User joins an existing team
    Given a team exists named "Platform Team"
    And I am on the signup page
    When I fill in "Display Name" with "Normal User"
    And I fill in "Email" with "user@example.com"
    And I fill in "Password" with "password123"
    And I fill in "Confirm Password" with "password123"
    And I choose "User" from "Register as"
    And I fill in "Department/Team Name" with "Platform Team"
    And I click the "Sign Up" button
    And I refresh the page
    And I open the drawer
    Then I should see "Platform Team" as the team name in the drawer
