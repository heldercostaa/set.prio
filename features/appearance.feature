Feature: Choose an appearance
  Scenario: Dark is default and light is a persistent explicit choice
    Given an English planner with no saved priorities
    Then I can switch between light and dark appearances and keep my choice
