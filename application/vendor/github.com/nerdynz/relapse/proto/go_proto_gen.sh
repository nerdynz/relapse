PROTO_FILE="./relapse.proto"


protoc --twirp_out=. --go_out=./ --go_opt=Mrelapse.proto=./ ${PROTO_FILE}

protoc -I ~/go/src/github.com/srikrsna/protoc-gen-gotag -I . --go_opt=Mrelapse.proto=github.com/nerdynz/relapse/proto  --go_out=$GOPATH/src ${PROTO_FILE} 
protoc -I ~/go/src/github.com/srikrsna/protoc-gen-gotag -I . --gotag_out=auto="db-as-lower_snake_case":. ${PROTO_FILE}
