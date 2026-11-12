Feature: Recognize recordings already watched
  Scenario: A zero rating still marks the recording as watched
    Given an English planner with no saved priorities
    When I mark Fisher as a must-see, rate the set zero, and add a comment
    Then Fisher's label indicates a watched recording
