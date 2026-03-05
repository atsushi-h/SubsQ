package sqlc

import (
	"testing"
)

func TestParseUUID(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		input   string
		wantErr bool
	}{
		{
			name:    "有効なUUID",
			input:   "550e8400-e29b-41d4-a716-446655440000",
			wantErr: false,
		},
		{
			name:    "空文字",
			input:   "",
			wantErr: true,
		},
		{
			name:    "不正な文字列",
			input:   "not-a-uuid",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, err := parseUUID(tc.input)
			if (err != nil) != tc.wantErr {
				t.Errorf("parseUUID(%q) error = %v, wantErr %v", tc.input, err, tc.wantErr)
			}
			if !tc.wantErr && !got.Valid {
				t.Errorf("parseUUID(%q) returned UUID with Valid=false", tc.input)
			}
		})
	}
}
