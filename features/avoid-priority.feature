Feature: Avoid unwanted performances
  Scenario: Keep an unwanted performance in its official day's avoid group
    Given an English planner with no saved priorities
    When I mark Fisher as an artist to avoid
    Then Fisher remains avoided on Friday after reloading
