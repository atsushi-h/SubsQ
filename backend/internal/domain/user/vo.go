package user

import (
	"errors"
	"strings"
)

type Email string

func (e Email) Validate() error {
	s := string(e)
	if s == "" {
		return errors.New("email is required")
	}
	if !strings.Contains(s, "@") {
		return errors.New("email is invalid")
	}
	return nil
}

func (e Email) String() string {
	return string(e)
}

// ParseEmail は raw 文字列を検証し Email を返す
func ParseEmail(raw string) (Email, error) {
	e := Email(raw)
	if err := e.Validate(); err != nil {
		return "", err
	}
	return e, nil
}
