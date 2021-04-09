package main

import (
	"context"
	"testing"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/nerdynz/relapse/daemon/relapse_proto"
	"google.golang.org/grpc"
	"gopkg.in/stretchr/testify.v1/assert"
)

func TestGetDatabase(t *testing.T) {
	conn, err := grpc.Dial(":3333", grpc.WithTimeout(10*time.Second), grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		panic(err)
	}
	defer conn.Close()
	client := relapse_proto.NewRelapseClient(conn)

	ctx := context.Background()
	resp, err := client.GetCapturesForADay(ctx, &relapse_proto.DayRequest{
		CaptureDayTimeSeconds: 1609585200000000000,
	})
	assert.NoError(t, err)
	spew.Dump(resp)
}

func TestStopCapturing(t *testing.T) {
	conn, err := grpc.Dial(":3333", grpc.WithTimeout(10*time.Second), grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		panic(err)
	}
	defer conn.Close()
	client := relapse_proto.NewRelapseClient(conn)
	ctx := context.Background()
	resp, err := client.StopCapture(ctx, &relapse_proto.StopRequest{})
	assert.NoError(t, err)
	spew.Dump(resp)
}

func TestStartCapturing(t *testing.T) {
	conn, err := grpc.Dial(":3333", grpc.WithTimeout(10*time.Second), grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		panic(err)
	}
	defer conn.Close()
	client := relapse_proto.NewRelapseClient(conn)
	ctx := context.Background()
	resp, err := client.StartCapture(ctx, &relapse_proto.StartRequest{})
	assert.NoError(t, err)
	spew.Dump(resp)
}
