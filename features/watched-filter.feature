Feature: Filter artists by watched sets
  Scenario: A zero rating updates watched filters in both views
    Given an English planner with no saved priorities
    Then watched filters follow recording ratings in the board and catalog
