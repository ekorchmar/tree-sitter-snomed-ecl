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
        $._conjunction,
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

    _dottedExpressiontAttribute: $ => seq($._dot, $._ws, $._eclAttributeName),

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

    memberOf: _ => seq(
      "^",
      optional(seq(
        $._ws,
        "[",
        $._ws,
        choice(
          $.refsetFieldNameSet,
          $.wildCard,
        ),
        $._ws,
        "]",
      )),
    ),

    // Description filter constraint
    descriptionFilterConstraint: $ => seq(
      "{{",
      $._ws,
      /d/i,
      $._ws,
      $._descriptionFilter,
      repeat(seq(
        $._ws,
        ",",
        $._descriptionFilter,
      )),
      $._ws,
      "}}",
    ),
    _descriptionFilter: $ => choice(
      $.termFilter,
      $.languageFilter,
      $.typeFilter,
      $.dialectFilter,
      $.moduleFilter,
      $.effectiveTimeFilter,
      $.activeFilter,
      $.descriptionIdFilter,
    ),

    termFilter: $ => seq(
      /term/i,
      $._ws,
      $.stringComparisonOperator,
      $._ws,
      choice(
        $.typedSearchTerm,
        $._typedSearchTermSet,
      ),
    ),

    languageFilter: $ => seq(
      /language/i,
      $._ws,
      $.booleanComparisonOperator,
      $._ws,
      choice(
        $.languageCode,
        $._languageCodeSet,
      ),
    ),

    languageCode: $ => seq($._alpha, $._alpha),
    _languageCodeSet: $ => seq(
      "(", $._ws,
      $.languageCode,
      repeat(seq($._mws, $.languageCode)),
      $._ws, ")"),

    typeFilter: $ => choice(
      $.typeIdFilter,
      $.typeTokenFilter,
    ),
    typeIdFilter: $ => seq(
        /typeid/i,
        $._ws,
        $.booleanComparisonOperator,
        $._ws,
        choice(
          $.subExpressionConstraint,
          $.eclConceptReferenceSet,
        ),
    ),
    typeTokenFilter: $ => seq(
      /type/i,
      $._ws,
      $.booleanComparisonOperator,
      $._ws,
      choice(
        $.typeToken,
        $._typeTokenSet,
      ),
    ),
    typeToken: $ => choice($.synonym, $.fullySpecifiedName, $.definition),
    _typeTokenSet: $ => seq(
      "(", $._ws,
      $.typeToken,
      repeat(seq($._mws, $.typeToken)),
      $._ws, ")"),

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

    // Refinement
    eclRefinement: $ => seq(
      $._subRefinement,
      $._ws,
      optionl(choice(
        $.conjunctionRefinementSet,
        $.disjunctionRefinementSet,
      )),
    ),

    conjunctionRefinementSet: $ => repeat1(seq(
      $._ws,
      $._conjunction,
      $._ws,
      $._subRefinement,
    )),
    disjunctionRefinementSet: $ => repeat1(seq(
      $._ws,
      $.disjunction,
      $._ws,
      $._subRefinement,
    )),

    _subRefinement: $ => choice(
      $.eclAttributeSet,
      $.eclAttributeGroup,
      seq("(", $._ws, $.eclRefinement, $._ws, ")"),
    ),

    eclAttributeSet: $ => seq(
      $._subAttributeSet,
      $._ws,
      optional(choice(
        $.conjunctionAttributeSet,
        $.disjunctionAttributeSet,
      )),
    ),

    conjunctionAttributeSet: $ => repeat1(seq(
      $._ws,
      $._conjunction,
      $._ws,
      $._subAttributeSet,
    )),
    disjunctionAttributeSet: $ => repeat1(seq(
      $._ws,
      $.disjunction,
      $._ws,
      $._subAttributeSet,
    )),

    _subAttributeSet: $ => choice(
      $.eclAttribute,
      seq("(", $._ws, $.eclAttributeSet, $._ws, ")"),
    ),

    _eclAttributeGroup: $ => seq(
      optional($._declaredCardinality),
      "{", $._ws, eclAttributeSet, $._ws, "}",
    ),

    eclAttribute: $ => seq(
      optional($._declaredCardinality),
      optional(seq($.reverseFlag, $._ws)),
      $._eclAttributeName, $._ws,
      choice(
        seq($.expressionComparisonOperator, $._ws, $.subExpressionConstraint),
        seq($.numericComparisonOperator, $._ws, "#", $.numericValue),
        seq($.stringComparisonOperator, $._ws, choice(
          $.typedSearchTerm,
          $._typedSearchTermSet,
        )),
        seq($.booleanComparisonOperator, $._ws, $.booleanValue),
      )
    ),

    _eclAttributeName: $ => $.subExpressionConstraint,

    // Constraint operators
    _constraintOperator: _ => choice(
      $.childOf,
      $.childOrSelfOf,
      $.descendantOf,
      $.descendantOrSelfOf,
      $.parentOf,
      $.parentOrSelfOf,
      $.ancestorOf,
      $.ancestorOrSelfOf,
      $.top,
      $.bottom,
    ),

    descendantOf: _ => "<",
    descendantOrSelfOf: _ => "<<",
    childOf: _ => "<!",
    childOrSelfOf: _ => "<<!",
    ancestorOf: _ => ">",
    ancestorOrSelfOf: _ => ">>",
    parentOf: _ => ">!",
    parentOrSelfOf: _ => ">>!",
    top: _ => "!!>",
    bottom: _ => "!!<",

    // Literals
    _dot: _ => '.',
    _SP: _ => ' ',
    reverseFlag: _ => 'R',
    wildCard: _ => '*',
    many: _ => '*',
    definition: _ => /def/i,
    fullySpecifiedName: _ => /fsn/i,
    synonym: _ => /syn/i,

    // Tokens
    _alpha: _ => /[a-z]/i,
    _declaredCardinality: $ => seq("[", $.cardinality, "]", $._ws),
    cardinality: $ => seq($.minValue, "..", $.maxValue),
    minValue: $ => $._nonNegativeIntegerValue,
    maxValue: $ => choice($._nonNegativeIntegerValue, $.many),
    
    // Set operators
    _conjunction: _ => choice(
      seq(/and/i, $._mws),
      ','
    ),
    disjunction: _ => seq(/or/i, $._mws),
    exclusion: _ => seq(/minus/i, $._mws),

    // Comparison operators
    expressionComparisonOperator: _ => /\!?=/,
    numericComparisonOperator: _ => choice(/\!?=/, /<=?/, />=?/),
    timeComparisonOperator: _ => choice(/\!?=/, /<=?/, />=?/),
    stringComparisonOperator: _ => /\!?=/,
    booleanComparisonOperator: _ => /\!?=/,
    idComparisonOperator: _ => /\!?=/,
  }
});
