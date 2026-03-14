@javascript
Feature: User Profile Settings
  As a Team Member
  I want to see my skill tags
  So that my team knows my expertise

  Scenario: Viewing skills on the settings page
    Given I am logged in as "Chris Wong"
    When I click the "Show Settings" button
    Then I should see "React" within the skill tags
    And I should see "Team Member" as my role