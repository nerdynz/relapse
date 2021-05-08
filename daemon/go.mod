module github.com/nerdynz/relapse/daemon

go 1.16

replace github.com/nerdynz/relapse/daemon/relapse_proto => ./relapse_proto

require (
	github.com/chai2010/webp v1.1.0 // indirect
	github.com/davecgh/go-spew v1.1.1
	github.com/fsnotify/fsnotify v1.4.9 // indirect
	github.com/gen2brain/shm v0.0.0-20200228170931-49f9650110c5 // indirect
	github.com/jmoiron/sqlx v1.2.0
	github.com/kbinani/screenshot v0.0.0-20191211154542-3a185f1ce18f
	github.com/lxn/win v0.0.0-20201111105847-2a20daff6a55 // indirect
	github.com/mattn/go-sqlite3 v1.14.6
	github.com/nerdynz/relapse/daemon/relapse_proto v0.0.0-00010101000000-000000000000
	github.com/nfnt/resize v0.0.0-20180221191011-83c6a9932646
	github.com/pelletier/go-toml v1.9.0 // indirect
	github.com/progrium/macdriver v0.1.0 // indirect
	github.com/sirupsen/logrus v1.7.0
	github.com/spf13/pflag v1.0.5
	github.com/spf13/viper v1.7.1
	golang.org/x/sys v0.0.0-20210403161142-5e06dd20ab57 // indirect
	google.golang.org/grpc v1.34.0
	google.golang.org/protobuf v1.26.0 // indirect
	gopkg.in/stretchr/testify.v1 v1.2.2
	gopkg.in/yaml.v2 v2.3.0 // indirect
)
