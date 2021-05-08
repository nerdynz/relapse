# generating golang

protoc relapse.proto --go_out=$GOPATH/src --go-grpc_out=$GOPATH/src

# generating javascript lib

- NOTE: you could use grpc-web and bypass using node

  https://www.npmjs.com/package/ts-protoc-gen

protoc-gen-grpc --js_out="import_style=commonjs,binary:../app/src/grpc" --grpc_out= --proto_path=./ ./relapse.proto



protoc \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --plugin=protoc-gen-grpc=${PROTOC_GEN_GRPC_PATH} \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="service=grpc-node:${OUT_DIR}" \
    --grpc_out="${OUT_DIR}" \
    users.proto base.proto