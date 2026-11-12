Feature: Prefer the recording of a joint act
  Scenario: A b2b score takes precedence and clearing it restores member scores
    Given an English planner with no saved priorities
    Then a rated joint recording takes precedence over its members and clearing it restores their scores
