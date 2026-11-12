Feature: Fractional recording ratings
  Scenario: Preserve a fractional recording score across a reload
    Given an English planner with no saved priorities
    When I score Fisher's recording eight and a half
    Then the fractional recording score is restored after reloading
