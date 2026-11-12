Feature: A browser-local festival plan
  Festivalgoers can keep personal priorities and recording assessments
  without changing the official performance days.

  Background:
    Given an English planner with no saved priorities

  Scenario: Restore a bilingual plan without treating zero as unrated
    When I mark Fisher as a must-see, rate the set zero, and add a comment
    And I switch to Brazilian Portuguese and reload
    Then my language, priority, zero rating, watched status, and multiline comment are restored

  Scenario: Clear an avoided performance without moving its official day
    When I mark Fisher as an artist to avoid
    Then Fisher remains avoided on Friday after reloading
    When I clear Fisher’s priority using the explicit selector
    Then Fisher returns to Friday’s unprioritized group
