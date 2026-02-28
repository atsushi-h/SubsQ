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
