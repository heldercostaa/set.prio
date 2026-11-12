Feature: Festival planning workflows
  The planner keeps official days, recording assessments, and complete exports usable across devices.

  Scenario: multiple appearances have independent priorities and export despite search and mobile day filters
    Given an English planner with no saved priorities
    Then the planner supports "multiple appearances have independent priorities and export despite search and mobile day filters"

  @desktop
  Scenario: mouse drag changes priorities only within the official day
    Given an English planner at 1440 pixels wide
    Then the planner supports "mouse drag changes priorities only within the official day"

  Scenario: 320px layout supports day selection, focus restoration, and reduced motion
    Given an English planner with no saved priorities
    Then the planner supports "320px layout supports day selection, focus restoration, and reduced motion"

  Scenario: catalog finds accented artist names and preserves named recording links
    Given an English planner with no saved priorities
    Then the planner supports "catalog finds accented artist names and preserves named recording links"

  @chromium
  Scenario: Chromium clipboard receives an HTML table with named set links
    Given an English planner with no saved priorities
    Then the planner supports "Chromium clipboard receives an HTML table with named set links"

  @desktop
  Scenario Outline: Hover previews remain stationary and usable
    Given an English planner at <width> pixels wide
    Then I can inspect "<artist>" without label movement

    Examples:
      | width | artist |
      | 1280 | Fisher |
      | 1024 | Smash The House Take Over: Dimitri Vegas b2b Lilly Palmer |
      | 1440 | Matisse & Sadko present Melodicca |

  Scenario: b2b details show both artists with independent recording ratings and one performance editor
    Given an English planner with no saved priorities
    Then the planner supports "b2b details show both artists with independent recording ratings and one performance editor"

  Scenario: clipboard failure offers a usable manual copy
    Given an English planner with no saved priorities
    Then the planner supports "clipboard failure offers a usable manual copy"

  Scenario: a fully prioritized catalog exports all groups beyond the viewport
    Given an English planner with no saved priorities
    Then the planner supports "a fully prioritized catalog exports all groups beyond the viewport"
