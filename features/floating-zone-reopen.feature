@desktop
Feature: Contextual floating priority targets
  Scenario: Targets appear only during movement and close after canceling or opening details
    Given an English planner with no saved priorities
    Then floating priority targets are hidden
    When I focus Fisher without hovering
    Then floating priority targets are hidden
    When I hover Fisher
    Then floating priority targets are hidden
    When I hold Fisher without moving
    Then floating priority targets are hidden
    When I move the held Fisher label
    Then floating priority targets show Fisher on Friday
    When I cancel the drag
    Then floating priority targets are hidden
    When I hover Fisher
    Then floating priority targets are hidden
    When I open and close Fisher's details
    Then floating priority targets are hidden
    When I hover Fisher
    Then floating priority targets are hidden
