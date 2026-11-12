Feature: Shareable planner filters
  Scenario: Keep filters on refresh and reset them without deleting the plan
    Given an English planner with no saved priorities
    Then filter choices survive refresh and reset leaves my saved plan intact

  Scenario: Restore shared links and browser history safely
    Given an English planner with no saved priorities
    Then shared filter links support browser history and the logo opens the unfiltered home
