module.exports = grammar({
  name: 'snomed-ecl',

  rules: {
    // The Entry point: expression Constraint:
    expressionConstraint: $ => seq(
      $._ws,
      choice(
        $.refinedExpressionConstraint,
        $._compoundExpressionConstraint,
        $.dottedExpressionConstraint,
        $.subExpressionConstraint),
      $._ws,
    ),

    // Different types of Expression Constraints:
    refinedExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      $._ws,
      ':',
      $.eclRefinement,
    ),

    _compoundExpressionConstraint: $ => choice(
      $.conjunctionExpressionConstraint,
      $.disjunctionExpressionConstraint,
      $.exclusionExpressionConstraint,
    ),

    conjunctionExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      repeat1(seq(
        $._ws,
        $.conjunction,
        $._ws,
        $.subExpressionConstraint,
      ))
    ),

    disjunctionExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      repeat1(seq(
        $._ws,
        $.disjunction,
        $._ws,
        $.subExpressionConstraint,
      ))
    ),

    exlusionExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      $._ws,
      $.exclusion,
      $._ws,
      $.subExpressionConstraint,
    ),

    dottedExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      repeat1(seq(
        $._ws,
        $._dot,
        $._dottedExpressiontAttribute,
      ))
    ),

    _dottedExpressiontAttribute: $ => seq($._dot, $._ws, $.eclAttributeName),

  /* ABNF excerpt:

subExpressionConstraint =
  [constraintOperator ws]
  (
    (
      [memberOf ws]
      (
        eclFocusConcept /
        "(" ws expressionConstraint ws ")"
      )
      *(ws memberFilterConstraint)
    ) /
    (
      eclFocusConcept /
      "(" ws expressionConstraint ws ")"
    )
  )
  *(
    ws
    (
      descriptionFilterConstraint /
      conceptFilterConstraint
    )
  )
  [ws historySupplement]

*/

    subExpressionConstraint: $ => seq(
      optional(seq($._constraintOperator, $._ws)),
      choice(
        seq(
          optional(seq($.memberOf, $._ws)),
          choice(
            $._eclFocusConcept,
            seq('(', $._ws, $.expressionConstraint, $._ws, ')')
          ),
          repeat(seq($._ws, $.memberFillerConstraint))
        ),
        choice(
          $._eclFocusConcept,
          seq('(', $._ws, $.expressionConstraint, $._ws, ')')
        )
      ),
      repeat(seq(
        $._ws,
        choice(
          $.descriptionFillerConstraint,
          $.conceptFillerConstraint,
        )
      )),
      optional(seq($._ws, $.historySupplement)),
    ),

    _eclFocusConcept: $ => choice(
      $.eclConceptReference,
      $._wildCard,
      $.altIdentifier,
    ),

    memberOf: _ => seq(
      "^",
      optional(seq(
        $._ws,
        "[",
        $._ws,
        choice(
          $.refsetFieldNameSet,
          $._wildCard,
        ),
        $._ws,
        "]",
      )),
    ),

    // Field names
    refsetFieldNameSet: $ => seq(
      refsetfieldName,
      repeat(seq(
        $._ws,
        ",",
        $.refsetfieldName,
      ))
    ),

    refsetfieldName: _ => repeat1($._alpha),

    // Concept reference (SCTID)
    _conceptNameInId: $ => seq(
        $._ws,
        "|",
        $._ws,
        $.term,
        $._ws,
        "|",
      ),

    eclConceptReference: $ => seq(
      $._conceptId,
      optional($._conceptNameInId),
    ),
    eclConceptReferenceSet: $ => seq(
      "(",
      $._ws,
      $.eclConceptReference,
      repeat1(seq(
        $._mws,
        ",",
        $._ws,
        $.eclConceptReference,
      )),
      $._ws,
      ")",
    ),
    _conceptId: _ => $.sctId,
    term: $ => seq(
      repeat1($._nonwsNonPipe),
      repeat(seq(
        repeat1($._SP),
        repeat1($._nonwsNonPipe),
      ))
    ),

    // Alternative identifier
    altIdentifier: $ => seq(
      choice(
        // With or without quotes
        seq(
          $._QM,
          $.altIdentifierSchemeAlias,
          "#",
          $.altIdentifierCodeWithinQuotes,
          $._QM,
        ),
        seq(
          $.altIdentifierSchemeAlias,
          "#",
          $.altIdentifierCodeWithoutQuotes,
        ),
      ),
      optional($._conceptNameInId),
    ),

    altIdentifierSchemeAlias: $ => seq(
      $._alpha,
      repeat(choice(
        $._alpha,
        $._dash,
        $._integerValue,
      )
    )),

    altIdentifierCodeWithinQuotes: $ => repeat1($._anyNonEscapedChar),
    altIdentifierCodeWithoutQuotes: $ => repeat1(choice(
      $._alpha,
      $._digit,
      $._dash,
      $._dot,
      "_",
    )),

    // Literals
    _dot: _ => '.',
    _wildCard: _ => '*',
    _SP: _ => ' ',

    // Tokens
    _alpha: _ => /[a-zA-Z]/,
    

  }
});
