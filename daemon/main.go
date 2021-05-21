package main

import (
	"log"
	"net"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/nerdynz/relapse/daemon/relapse_proto"
	"github.com/sirupsen/logrus"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"golang.org/x/net/http2"
	"google.golang.org/grpc"
)

func main() {
	viper.SetDefault("capture-path", "./")
	viper.SetDefault("userdata-path", "./")

	pflag.String("capture-path", viper.GetString("capture-path"), "path for database and captures")
	pflag.String("userdata-path", viper.GetString("userdata-path"), "path for database and captures")
	pflag.Parse()

	if err := viper.BindPFlag("capture-path", pflag.Lookup("capture-path")); err != nil {
		logrus.Errorf("Failed to setup binary flag capture-path: %v", err)
		return
	}
	if err := viper.BindPFlag("userdata-path", pflag.Lookup("userdata-path")); err != nil {
		logrus.Errorf("Failed to setup binary flag userdata-path: %v", err)
		return
	}

	databaseFilePath := viper.GetString("userdata-path") + "relapse-db.db"

	var err error
	db, err := sqlx.Connect("sqlite3", databaseFilePath)
	if err != nil {
		logrus.Error("Failed to connect to database", err)
		return
	}
	defer db.Close()

	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS capture (
		capture_id							INTEGER PRIMARY KEY,
		app_name								TEXT DEFAULT '',
		app_path								TEXT DEFAULT '',
		filepath								TEXT DEFAULT '',
		fullpath								TEXT DEFAULT '',
		capture_time_seconds			INTEGER,
		capture_day_time_seconds	INTEGER
	);
	`)
	if err != nil {
		logrus.Error("Failed to create schema", err)
		return
	}

	_, err = db.Exec(`
	drop view if exists capture_day_summary;
	create view if not exists capture_day_summary
	AS
	select capture_day_time_seconds, count(capture_time_seconds) * 30 as total_captured_time_seconds, count(capture_time_seconds) as total_captures_for_day, sum(capture_size_bytes) as total_capture_size_bytes, is_purged 
	from capture
	group by capture_day_time_seconds, is_purged;
		`)
	if err != nil {
		logrus.Error("view capture_day_summary: ", err)
		return

	}
	_, err = db.Exec("ALTER TABLE capture ADD COLUMN capture_size_bytes INTEGER;")
	if err != nil {
		logrus.Error("Alter table failed: ", err)
	}
	_, err = db.Exec("ALTER TABLE capture ADD COLUMN is_purged BOOLEAN;")
	if err != nil {
		logrus.Error("Alter table failed: ", err)
	}

	port := ":3333"
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalln(err)
	}

	srv := NewCaptureServer(db)
	s := grpc.NewServer()
	relapse_proto.RegisterRelapseServer(s, srv)
	logrus.Info("running grpc on port ", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalln(err)
	}
}
