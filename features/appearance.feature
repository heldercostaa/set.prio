Feature: Dark appearance
  Scenario Outline: Dark appearance ignores device and retired light preferences
    Given an English planner with no saved priorities
    When I mark Fisher as a must-see, rate the set zero, and add a comment
    And the device uses "<appearance>" appearance with a saved light preference
    Then the planner stays dark without appearance controls and preserves my plan

    Examples:
      | appearance |
      | light      |
      | dark       |
