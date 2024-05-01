module.exports = grammar({
  name: 'snomed_ecl',

  rules: {
    // The Entry point: expression Constraint:
    expressionConstraint: $ => seq(
      ws($),
      choice(
        $.refinedExpressionConstraint,
        $._compoundExpressionConstraint,
        $.dottedExpressionConstraint,
        $.subExpressionConstraint),
      ws($),
    ),

    // Different types of Expression Constraints:
    refinedExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      ws($),
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
        ws($),
        $.conjunction,
        ws($),
        $.subExpressionConstraint,
      ))
    ),

    disjunctionExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      repeat1(seq(
        ws($),
        $.disjunction,
        ws($),
        $.subExpressionConstraint,
      ))
    ),

    exclusionExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      ws($),
      $.exclusion,
      ws($),
      $.subExpressionConstraint,
    ),

    dottedExpressionConstraint: $ => seq(
      $.subExpressionConstraint,
      repeat1(seq(
        ws($),
        $._dot,
        $._dottedExpressiontAttribute,
      ))
    ),

    _dottedExpressiontAttribute: $ => seq($._dot, ws($), $._eclAttributeName),

    subExpressionConstraint: $ => seq(
      optional(seq($._constraintOperator, ws($))),
      choice(
        seq(
          optional(seq($.memberOf, ws($))),
          choice(
            $._eclFocusConcept,
            seq('(', ws($), $.expressionConstraint, ws($), ')')
          ),
          repeat(seq(ws($), $.memberFilterConstraint))
        ),
        choice(
          $._eclFocusConcept,
          seq('(', ws($), $.expressionConstraint, ws($), ')')
        )
      ),
      repeat(seq(
        ws($),
        choice(
          $.descriptionFilterConstraint,
          $.conceptFilterConstraint,
        )
      )),
      optional(seq(ws($), $.historySupplement)),
    ),

    _eclFocusConcept: $ => choice(
      $.eclConceptReference,
      $.wildCard,
      $.altIdentifier,
    ),

    memberOf: $ => seq(
      "^",
      optional(seq(
        ws($),
        "[",
        ws($),
        choice(
          $._refsetFieldNameSet,
          $.wildCard,
        ),
        ws($),
        "]",
      )),
    ),

    // Concept filter constraint
    conceptFilterConstraint: $ => seq(
      "{{",
      ws($),
      /c/i,
      ws($),
      $._conceptFilter,
      repeat(seq(
        ws($),
        ",",
        $._conceptFilter,
      )),
      ws($),
      "}}",
    ),
    _conceptFilter: $ => choice(
      $._definitionStatusFilter,
      $.moduleFilter,
      $.effectiveTimeFilter,
      $.activeFilter,
    ),

    // Description filter constraint
    descriptionFilterConstraint: $ => seq(
      "{{",
      ws($),
      /d/i,
      ws($),
      $._descriptionFilter,
      repeat(seq(
        ws($),
        ",",
        $._descriptionFilter,
      )),
      ws($),
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

    // Shared filters
    termFilter: $ => seq(
      /term/i,
      ws($),
      $.stringComparisonOperator,
      ws($),
      choice(
        $.typedSearchTerm,
        $._typedSearchTermSet,
      ),
    ),

    languageFilter: $ => seq(
      /language/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice(
        $.languageCode,
        $._languageCodeSet,
      ),
    ),

    languageCode: _ => /[a-z]{2}/i,
    _languageCodeSet: $ => seq(
      "(", ws($),
      $.languageCode,
      repeat(seq($._mws, $.languageCode)),
      ws($), ")"),

    typeFilter: $ => choice(
      $.typeIdFilter,
      $.typeTokenFilter,
    ),
    typeIdFilter: $ => seq(
        /typeid/i,
        ws($),
        $.booleanComparisonOperator,
        ws($),
        choice(
          $.subExpressionConstraint,
          $.eclConceptReferenceSet,
        ),
    ),
    typeTokenFilter: $ => seq(
      /type/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice(
        $.typeToken,
        $._typeTokenSet,
      ),
    ),
    typeToken: $ => choice($.synonym, $.fullySpecifiedName, $.definition),
    _typeTokenSet: $ => seq(
      "(", ws($),
      $.typeToken,
      repeat(seq($._mws, $.typeToken)),
      ws($), ")"),

    dialectFilter: $ => seq(
      choice($.dialectIdFilter, $.dialectAliasFilter),
      optional(seq(ws($), $.acceptabilitySet))
    ),
    dialectIdFilter: $ => seq(
      /dialectid/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice(
        $.subExpressionConstraint,
        $.dialectIdSet,
      ),
    ),
    dialectIdSet: $ => seq(
      "(", ws($),
      $.eclConceptReference,
      optional(seq($._mws, $.acceptabilitySet)),
      repeat(seq(
        $._mws,
        $.eclConceptReference,
        optional(seq($._mws, $.acceptabilitySet)),
      )),
      ws($), ")"),
    dialectAliasFilter: $ => seq(
      /dialect/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice(
        $.dialectAlias,
        $._dialectAliasSet,
      ),
    ),
    dialectAlias: _ => /[a-z][a-z\d\-]*/i,
    _dialectAliasSet: $ => seq(
      "(", ws($),
      $.dialectAlias,
      optional(seq($._mws, $.acceptabilitySet)),
      repeat(seq(
        $._mws,
        $.dialectAlias,
        optional(seq($._mws, $.acceptabilitySet)),
      )),
      ws($), ")"),
    acceptabilitySet: $ => choice(
      $.acceptabilityConceptReferenceSet,
      $.acceptabilityTokenSet,
    ),
    acceptabilityConceptReferenceSet: $ => seq(
      "(", ws($),
      $.eclConceptReference,
      repeat(seq(
        $._mws,
        $.eclConceptReference,
      )),
      ws($), ")"),
    acceptabilityTokenSet: $ => choice($.preferred, $.acceptable),

    moduleFilter: $ => seq(
      /module/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice(
        $.subExpressionConstraint,
        $.eclConceptReferenceSet,
      ),
    ),

    effectiveTimeFilter: $ => seq(
      /effectivetime/i,
      ws($),
      $.timeComparisonOperator,
      ws($),
      choice(
        $.timeValue,
        $._timeValueSet,
      ),
    ),
    timeValue: $ => seq($._QM, optional(seq($.year, $.month, $.day)), $._QM,),
    _timeValueSet: $ => seq(
      "(", ws($),
      $.timeValue,
      repeat(seq($._mws, $.timeValue)),
      ws($), ")"),

    activeFilter: $ => seq(
      /active/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice($.activeTrueValue, $.activeFalseValue),
    ),

    descriptionIdFilter: $ => seq(
      /id/i,
      ws($),
      $.idComparisonOperator,
      ws($),
      choice(
        $.sctId,
        $._sctIdSet,
      ),
    ),
    _sctIdSet: $ => seq(
      "(", ws($),
      $.sctId,
      repeat(seq($._mws, $.sctId)),
      ws($), ")"),

    _definitionStatusFilter: $ => choice(
      $.definitionStatusIdFilter,
      $.definitionStatusTokenFilter,
    ),
    definitionStatusIdFilter: $ => seq(
      /definitionstatusid/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice(
        $.subExpressionConstraint,
        $.eclConceptReferenceSet,
      ),
    ),
    definitionStatusTokenFilter: $ => seq(
      /definitionstatus/i,
      ws($),
      $.booleanComparisonOperator,
      ws($),
      choice(
        $.definitionStatusToken,
        $._definitionStatusTokenSet,
      ),
    ),
    definitionStatusToken: $ => choice($.primitiveToken, $.definedToken),
    _definitionStatusTokenSet: $ => seq(
      "(", ws($),
      $.definitionStatusToken,
      repeat(seq($._mws, $.definitionStatusToken)),
      ws($), ")"),

    _refsetFieldNameSet: $ => seq(
      $.refsetFieldName,
      repeat(seq(
        ws($),
        ",",
        $.refsetFieldName,
      ))
    ),

    // Concept reference (SCTID)
    _conceptNameInId: $ => seq(
        ws($),
        "|",
        ws($),
        $.term,
        ws($),
        "|",
      ),

    eclConceptReference: $ => seq(
      $._conceptId,
      optional($._conceptNameInId),
    ),
    eclConceptReferenceSet: $ => seq(
      "(",
      ws($),
      $.eclConceptReference,
      repeat1(seq(
        $._mws,
        ",",
        ws($),
        $.eclConceptReference,
      )),
      ws($),
      ")",
    ),
    _conceptId: $ => $.sctId,
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

    altIdentifierSchemeAlias: _ => /[a-z\d\-]+/i,
    altIdentifierCodeWithinQuotes: $ => repeat1($._anyNonEscapedChar),
    altIdentifierCodeWithoutQuotes: _ => /[\w\-\.]+/i,

    // Refinement
    eclRefinement: $ => seq(
      $._subRefinement,
      ws($),
      optional(choice(
        $.conjunctionRefinementSet,
        $.disjunctionRefinementSet,
      )),
    ),

    conjunctionRefinementSet: $ => repeat1(seq(
      ws($),
      $.conjunction,
      ws($),
      $._subRefinement,
    )),
    disjunctionRefinementSet: $ => repeat1(seq(
      ws($),
      $.disjunction,
      ws($),
      $._subRefinement,
    )),

    _subRefinement: $ => choice(
      $.eclAttributeSet,
      $.eclAttributeGroup,
      seq("(", ws($), $.eclRefinement, ws($), ")"),
    ),

    eclAttributeSet: $ => seq(
      $._subAttributeSet,
      ws($),
      optional(choice(
        $.conjunctionAttributeSet,
        $.disjunctionAttributeSet,
      )),
    ),

    conjunctionAttributeSet: $ => repeat1(seq(
      ws($),
      $.conjunction,
      ws($),
      $._subAttributeSet,
    )),
    disjunctionAttributeSet: $ => repeat1(seq(
      ws($),
      $.disjunction,
      ws($),
      $._subAttributeSet,
    )),

    _subAttributeSet: $ => choice(
      $.eclAttribute,
      seq("(", ws($), $.eclAttributeSet, ws($), ")"),
    ),

    eclAttributeGroup: $ => seq(
      optional($._declaredCardinality),
      "{", ws($), $.eclAttributeSet, ws($), "}",
    ),

    eclAttribute: $ => seq(
      optional($._declaredCardinality),
      optional(seq($.reverseFlag, ws($))),
      $._eclAttributeName, ws($),
      choice(
        seq($.expressionComparisonOperator, ws($), $.subExpressionConstraint),
        seq($.numericComparisonOperator, ws($), "#", $.numericValue),
        seq($.stringComparisonOperator, ws($), choice(
          $.typedSearchTerm,
          $._typedSearchTermSet,
        )),
        seq($.booleanComparisonOperator, ws($), $.booleanValue),
      )
    ),

    _eclAttributeName: $ => $.subExpressionConstraint,

// TODO: Implement the following rules
    // Member filter constraint
    memberFilterConstraint: _ => /TODO/,

    // History supplement
    historySupplement: _ => /TODO/,

    // Typed search term
    typedSearchTerm: _ => /TODO/,
    _typedSearchTermSet: _ => /TODO/,

    // Constraint operators
    _constraintOperator: $ => choice(
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
    _HTAB: _ => '\t',
    _QM: _ => '"',
    _CR: _ => '\r',
    _LF: _ => '\n',
    _BS: _ => '\\',

    reverseFlag: _ => 'R',
    wildCard: _ => '*',
    many: _ => '*',
    definition: _ => /def/i,
    fullySpecifiedName: _ => /fsn/i,
    synonym: _ => /syn/i,
    preferred: _ => /preferred/i,
    acceptable: _ => /acceptable/i,
    activeTrueValue: _ => /true|1/,
    activeFalseValue: _ => /false|0/,
    primitiveToken: _ => /primitive/i,
    definedToken: _ => /defined/i,
    // TODO: These are placeholders:
    _nonwsNonPipe: _ => /\w+/,
    _anyNonEscapedChar: _ => /./,

    // Tokens
    sctId: _ => /[1-9]\d{5,17}/,
    refsetFieldName: _ => /[a-z]+/i,
    _declaredCardinality: $ => seq("[", $.cardinality, "]", ws($)),
    cardinality: $ => seq($.minValue, "..", $.maxValue),
    minValue: $ => $.integerValue,
    maxValue: $ => choice($.integerValue, $.many),
    integerValue: _ => /0|[1-9]\d*/,
    decimalValue: $ => seq($.integerValue, ".", /\d+/),
    year: _ => /[1-9]\d{3}/,
    month: _ => /0[1-9]|1[0-2]/,
    day: _ => /0[1-9]|[12]\d|3[01]/,
    numericValue: $ => seq(
      optional(/-|\+/),
      choice($.integerValue, $.decimalValue),
    ),
    booleanValue: _ => /true|false/i,

    // Whitespaces
    _ws: $ => repeat(choice($._SP, $._HTAB, $._CR, $._LF, $.comment)),
    _mws: $ => repeat1(choice($._SP, $._HTAB, $._CR, $._LF, $.comment)),
    // TODO: placeholder for comments
    comment: _ => seq("/* ", /.*/, " */"),
    
    // Set operators
    conjunction: $ => choice(
      seq(/and/i, $._mws),
      ','
    ),
    disjunction: $ => seq(/or/i, $._mws),
    exclusion: $ => seq(/minus/i, $._mws),

    // Comparison operators
    expressionComparisonOperator: _ => /\!?=/,
    numericComparisonOperator: _ => choice(/\!?=/, /<=?/, />=?/),
    timeComparisonOperator: _ => choice(/\!?=/, /<=?/, />=?/),
    stringComparisonOperator: _ => /\!?=/,
    booleanComparisonOperator: _ => /\!?=/,
    idComparisonOperator: _ => /\!?=/,
  }
});


// Function to make all whitespace optional
function ws(rules) {
  return optional(repeat(choice(
    rules._SP,
    rules._HTAB,
    rules._CR,
    rules._LF,
    rules.comment,
  )))
}

