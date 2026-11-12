@desktop
Feature: Contextual floating priority targets
  Scenario: Targets follow artist hover and stay closed after opening details
    Given an English planner with no saved priorities
    Then floating priority targets are hidden
    When I focus Fisher without hovering
    Then floating priority targets are hidden
    When I hover Fisher
    Then floating priority targets show Fisher on Friday
    When I leave Fisher
    Then floating priority targets are hidden
    When I hover Fisher
    Then floating priority targets show Fisher on Friday
    When I open and close Fisher's details
    Then floating priority targets are hidden
    When I hover Fisher
    Then floating priority targets show Fisher on Friday
