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
        ".",
        $._dottedExpressiontAttribute,
      ))
    ),

    _dottedExpressiontAttribute: $ => seq(".", ws($), $._eclAttributeName),

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
    timeValue: $ => seq('"', optional(seq($.year, $.month, $.day)), '"',),
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

    memberFieldFilter: $ => seq(
      $.refsetFieldName,
      ws($),
      choice(
        seq($.expressionComparisonOperator, ws($), $.subExpressionConstraint),
        seq($.numericComparisonOperator, ws($), "#", $.numericValue),
        seq($.stringComparisonOperator, ws($), choice(
          $.typedSearchTerm,
          $._typedSearchTermSet,
        )),
        seq($.booleanComparisonOperator, ws($), $.booleanValue),
        seq($.timeComparisonOperator, ws($), choice(
          $.timeValue,
          $._timeValueSet,
        )),
      )
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
        / +/, repeat1($._nonwsNonPipe),
      ))
    ),

    // Alternative identifier
    altIdentifier: $ => seq(
      choice(
        // With or without quotes
        seq(
          '"',
          $.altIdentifierSchemeAlias,
          "#",
          $.altIdentifierCodeWithinQuotes,
          '"',
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

    // Member filter constraint
    memberFilterConstraint: $ => seq(
      "{{",
      ws($),
      /m/i,
      ws($),
      $._memberFilter,
      repeat(seq(
        ws($),
        ",",
        $._memberFilter,
      )),
      ws($),
      "}}",
    ),
    _memberFilter: $ => choice(
      $.moduleFilter,
      $.effectiveTimeFilter,
      $.activeFilter,
      $.memberFieldFilter,
    ),

    // History supplement
    historySupplement: $ => seq(
      "{{",
      ws($),
      "+",
      ws($),
      /history/i,
      optional(choice(
        $.historyProfileSuffix,
        seq(ws($), $.historySubset),
      )),
      ws($),
      "}}",
    ),
    historyProfileSuffix: $ => choice(
      $.historyMinimumSuffix,
      $.historyModerateSuffix,
      $.historyMaximumSuffix,
    ),
    historySubset: $ => seq(
      "(",
      ws($),
      $.expressionConstraint,
      ws($),
      ")",
    ),

    // Typed search term
    typedSearchTerm: $ => choice(
      seq(
        optional(seq(/match/i, ws($), ":", ws($))),
        $._matchSearchTermSet,
      ),
      seq(/wild/i, ws($), ":", ws($), '"', $.wildSearchTerm, '"'),
    ),
    _typedSearchTermSet: $ => seq(
      "(", ws($),
      $.typedSearchTerm,
      repeat(seq($._mws, $.typedSearchTerm)),
      ws($), ")"),
    matchSearchTerm: $ => repeat1(seq(
      $._nonwsNonEscapedChar,
      $._escapedChar,
    )),
    _matchSearchTermSet: $ => seq(
      "", ws($),
      $.matchSearchTerm,
      repeat(seq($._mws, $.matchSearchTerm)),
      ws($), ""),
    wildSearchTerm: $ => repeat1(choice(
      $._anyNonEscapedChar,
      $._escapedWildChar,
    )),

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
    booleanValue: _ => /true|false/i,
    _escapedWildChar: _ => /\\["\\\*]/,
    _escapedChar: _ => /\\[\\\"]/,
    /* NB: ABNF source gives definition for the most primitive tokens
     * in literal byte content, abstracting below both UTF-8 and ASCII.
     * This is not how Tree-sitter works, because here we can not go
     * lower than UTF-8.
     * As such, tokens will be defined semantically, not byte-wise;
     * I do not foresee breaking incompatibility with existing
     * ABNF-reliant implementations; should it appear, I will have to
     * literally define these rules in src/parce.c
    */
    _nonStarChar: _ => /[^\*]/,
    _starWithNonFSlash: _ => /\*[^\/]/, // Any star not followed by '/'
    _nonwsNonPipe: _ => /[^\|\u0000- ]/, // Anything above 0x20, except '|'
    _anyNonEscapedChar: _ => choice(
      // 'Normal' whitespaces
      /[\t\n\r ]/,
      // Anything between 0x21 and 0x7E
      /[\u0021-\u007E]/,
      // Anything above 0x30
      /[\u0080-\uFFFF]/,
    ),
    _nonwsNonEscapedChar: _ => choice(
      "\u0021",
      /[\u0023-\u005B]/,
      /[\u005D-\uFFFF]/,
    ),

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
    historyMinimumSuffix: _ => /[\-_]min/i,
    historyModerateSuffix: _ => /[\-_]mod/i,
    historyMaximumSuffix: _ => /[\-_]max/i,

    // Whitespaces
    _mws: $ => repeat1(choice(/ \t\r\n/, $.comment)),
    comment: $ => seq(
      "/*",
      repeat(choice($._nonStarChar, $._starWithNonFSlash)),
      "*/"
    ),
    
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
    / \t\r\n/, rules.comment,
  )))
}

