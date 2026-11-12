@touch
Feature: Swipe between festival days
  Scenario: Change days without changing artists or treating scrolling as navigation
    Given a narrow English planner
    When I preview and cancel a partial day swipe
    Then Friday is selected
    When I swipe through the festival days and back
    Then Friday is selected
    When I make vertical, short, and cancelled gestures
    Then Friday is selected
    When I swipe left starting on Fisher's label
    Then Saturday is selected
    And artist details stay closed
    When I reload the planner
    Then Saturday is selected
