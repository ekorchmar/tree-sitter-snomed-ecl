package tree_sitter_snomed_ecl_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-snomed_ecl"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_snomed_ecl.Language())
	if language == nil {
		t.Errorf("Error loading SnomedEcl grammar")
	}
}
