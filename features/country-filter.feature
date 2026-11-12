Feature: Discover artists by their countries
  Scenario: Filter countries without hiding a joint act's different origins
    Given an English planner with no saved priorities
    When I explore Australian artists and a multinational project
    Then countries filter both views and preserve each member's origin
