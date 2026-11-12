Feature: Sort artists
  Scenario: Name, rating and genre sorting apply to both views
    Given an English planner with no saved priorities
    Then I can sort both views while keeping unrated artists last and priority groups intact
