@contract
Feature: Safe browser-local preference lifecycle
  Scenario Outline: Recover an invalid save without deleting its original content
    Given a saved plan containing "<kind>"
    When I prioritize Fisher through artist details
    Then the original "<kind>" save remains recoverable alongside the new plan
    Examples:
      | kind |
      | malformed JSON |
      | future version |
      | invalid rating |

  Scenario: Failed backup leaves the original save untouched
    Given an unreadable plan whose backup cannot be written
    When I prioritize Fisher through artist details
    Then the protected original is untouched while the temporary priority works

  Scenario: Blocked storage keeps temporary planning usable
    Given a browser that blocks reading saved preferences
    When I prioritize Fisher through artist details
    Then the storage warning allows temporary planning

  Scenario: A catalog refresh preserves edits for absent appearances
    Given a plan containing appearances missing from the current catalog
    When I prioritize Fisher through artist details
    Then catalog updates retain absent appearances and recording ratings

  Scenario Outline: Preserve an existing plan through the project rename
    Given my previous plan is available as "<source>"
    Then the renamed planner preserves it without replacing newer edits
    Examples:
      | source |
      | previous storage key |
      | domain transfer |
      | conflicting domain transfer |
