Feature: Prioritize without scrolling back through the lineup
  Scenario: Use floating priority actions and return to the top
    Given a narrow English planner
    When I open Fisher's quick priority actions
    And I choose must-see from the floating controls
    Then Fisher is prioritized and the floating controls remain reachable
    When I use the floating back-to-top button
    Then the planner returns to the top
