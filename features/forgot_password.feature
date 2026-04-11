@javascript
Feature: Forgot Password
  As a user
  I want to request a password reset from sign in
  So that I can regain access to my account

  Scenario: Requesting a reset email from sign in
    Given a user account exists with email "forgot@example.com"
    And I am on the sign in page
    When I click the "Forgot your password?" link on sign in
    And I fill forgot password email with "forgot@example.com"
    And I submit forgot password request
    Then I should see the text "Password reset email sent! Please check your inbox."
