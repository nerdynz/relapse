package main

import (
	"testing"

	"gopkg.in/stretchr/testify.v1/assert"
)

func TestXxx(t *testing.T) {
	ba, err := grabScreenInfo()
	assert.NoError(t, err, "unknown err")
	t.Logf("blka %v", ba)
}

func TestGetPrimary(t *testing.T) {
	t.Logf("primary screen res => %s", getPrimary())
	assert.Contains(t, getPrimary().String(), "x", "Primary screen failed to return a resolution")
}

func TestGetScreenResolutionAtIndex(t *testing.T) {
	res := getScreenResolutionAtIndex(1)
	t.Logf("screen res => %s", res)
	assert.Contains(t, res.String(), "x", "screen failed to return a resolution")
}
