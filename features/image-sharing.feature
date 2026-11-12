@touch
Feature: Share a complete PNG through the device share sheet
  Scenario: Deliver an image file from an explicit share action
    Given an English planner with no saved priorities
    And this device supports sharing image files
    When I prepare and share my priority image
    Then the native share request contains a valid PNG file
