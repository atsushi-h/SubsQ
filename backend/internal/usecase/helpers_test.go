package usecase_test

import (
	"errors"
	"testing"
)

// strPtr はテスト用の文字列ポインタヘルパー
func strPtr(s string) *string { return &s }

// assertError はエラーの期待値と実際値を比較するヘルパー
func assertError(t *testing.T, want, got error) {
	t.Helper()
	if want == nil && got != nil {
		t.Fatalf("unexpected error: %v", got)
	}
	if want != nil && got == nil {
		t.Fatalf("expected error %v, got nil", want)
	}
	if want != nil && got != nil {
		if !errors.Is(got, want) && got.Error() != want.Error() {
			t.Fatalf("want error %v, got %v", want, got)
		}
	}
}
