@javascript
Feature: User Profile Settings
  As a Team Member
  I want to see my skill tags
  So that my team knows my expertise

  Scenario: Viewing skills on the settings page
    Given I am logged in as "Chris Wong"
    When I open the drawer
    And I click the "Settings" link
    Then I should see "react" within the skill tags
    And I should see "team_member" as my role