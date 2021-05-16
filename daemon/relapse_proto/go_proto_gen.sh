PROTO_FILE="./relapse.proto"

protoc -I ~/go/src/github.com/srikrsna/protoc-gen-gotag -I . --go_opt=Mrelapse.proto=github.com/nerdynz/relapse/daemon/relapse_proto  --go_out=$GOPATH/src --go-grpc_out=$GOPATH/src ${PROTO_FILE} 
protoc -I ~/go/src/github.com/srikrsna/protoc-gen-gotag -I . --gotag_out=auto="db-as-lower_snake_case":. ${PROTO_FILE}