@touch
Feature: Share a single rated set
  Scenario: Share a zero score and include updated priority and artist notes
    Given an English planner with no saved priorities
    And this device supports sharing image files
    Then I can preview and share Fisher's zero score with the current priority setting

  Scenario: Download joint and individual scores from their set details
    Given an English planner with no saved priorities
    Then I can share joint and member ratings from their set details
