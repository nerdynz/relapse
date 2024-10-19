PROTO_FILE="./relapse.proto"

protoc --twirp_out=. --go_out=./ --go_opt=Mrelapse.proto=./ ${PROTO_FILE}
