Feature: Filter the lineup by several genres
  Scenario: Combine genres and clear the selection
    Given an English planner with no saved priorities
    When I select House, Techno, and Dubstep in the catalog genre filter
    Then artists from either genre remain visible and other genres are hidden
    When I clear the genre selection
    Then the full artist catalog is available again
