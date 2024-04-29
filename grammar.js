module.exports = grammar({
  name: 'snomed-ecl',

  rules: {
    // The Expression Constraint:
    expression_constraint: $ => seq(
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
        $.dot,
        $._dottedExpressiontAttribute,
      ))
    ),

    _dottedExpressiontAttribute: $ => seq($.dot, $._ws, $.eclAttributeName),

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
      $.wildCard,
      $.altIdentifier,
    ),

    dot: _ => '.',


  }
});
