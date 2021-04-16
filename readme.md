# generating golang

protoc relapse.proto --go_out=$GOPATH/src --go-grpc_out=$GOPATH/src

# generating javascript lib

- NOTE: you could use grpc-web and bypass using node

  https://www.npmjs.com/package/ts-protoc-gen

protoc-gen-grpc --js_out="import_style=commonjs,binary:../app/src/grpc" --grpc_out="../app/src/grpc" --proto_path=./ ./relapse.proto
