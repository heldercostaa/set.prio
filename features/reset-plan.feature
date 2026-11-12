Feature: Reset a local plan deliberately
  Scenario: Cancel or confirm losing the saved plan
    Given an English planner with no saved priorities
    When I mark Fisher as a must-see, rate the set zero, and add a comment
    Then I can cancel resetting before deliberately erasing the plan
