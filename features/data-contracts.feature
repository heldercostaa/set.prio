@contract @data
Feature: Catalog, recording, and export contracts

  Scenario: exports only prioritized appearances in festival order and shares a zero recording score
    Then the data contract "exports only prioritized appearances in festival order and shares a zero recording score" holds

  Scenario: produces the specified eight-column CSV, preserves Unicode and multiline text, and neutralizes formulas
    Then the data contract "produces the specified eight-column CSV, preserves Unicode and multiline text, and neutralizes formulas" holds

  Scenario: copies named links and escapes HTML content while providing a localized text fallback
    Then the data contract "copies named links and escapes HTML content while providing a localized text fallback" holds

  Scenario: labels representative member recordings without changing their named festival link
    Then the data contract "labels representative member recordings without changing their named festival link" holds

  Scenario: expands a b2b into attributed artist rows with their own sets, genres and ratings
    Then the data contract "expands a b2b into attributed artist rows with their own sets, genres and ratings" holds

  Scenario: keeps catalog identifiers, references, genres, and recording metadata valid
    Then the data contract "keeps catalog identifiers, references, genres, and recording metadata valid" holds

  Scenario: recording links expose their event and representative status
    Then the data contract "recording links expose their event and representative status" holds

  Scenario: unavailable recordings are localized without search links
    Then the data contract "unavailable recordings are localized without search links" holds
