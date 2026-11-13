@contract
Feature: Language preference
  Scenario: Start in Portuguese and remember language changes
    Given a fresh planner with no saved preferences
    Then Portuguese is first and selected, and language choices survive reload

  Scenario Outline: Fall back to Portuguese when an existing plan has no valid language
    Given a saved plan with <language> language
    Then Portuguese is selected without losing the saved plan
    Examples:
      | language |
      | missing |
      | invalid |
