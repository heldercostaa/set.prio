@touch
Feature: Prioritize without scrolling back through the lineup
  Scenario: Drop a dragged artist into a floating priority zone
    Given a narrow English planner
    When I drag Fisher into the floating must-see zone
    Then Fisher stays prioritized on the official day after the drop
    When I use the floating back-to-top button
    Then the planner returns to the top
