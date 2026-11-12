Feature: A browser-local festival plan
  Festivalgoers can keep personal priorities and recording assessments
  without changing the official performance days.

  Background:
    Given an English planner with no saved priorities

  Scenario: Restore a bilingual plan without treating zero as unrated
    When I mark Fisher as a must-see, rate the set zero, and add a comment
    And I switch to Brazilian Portuguese and reload
    Then my language, priority, zero rating, and multiline comment are restored

  Scenario: Clear a priority without moving the official appearance
    When I mark Fisher as a must-see, rate the set zero, and add a comment
    And I clear Fisher’s priority using the explicit selector
    Then Fisher returns to Friday’s unprioritized group
