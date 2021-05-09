# Path to this plugin
PROTOC_GEN_TS_PATH="/Users/jaybeecave/.nvm/versions/node/v14.15.4/bin/protoc-gen-ts"
PROTOC_GEN_GRPC_PATH="/Users/jaybeecave/.nvm/versions/node/v14.15.4/bin/grpc_tools_node_protoc_plugin"

# Directory to write generated code to (.js and .d.ts files)
OUT_DIR="../app/src/grpc"

PROTO_FILE="./relapse.proto"


# protoc \
#     --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
#     --plugin="protoc-gen-grpc=${PROTOC_GEN_GRPC_PATH}" \
#     --js_out="import_style=commonjs,binary:${OUT_DIR}" \
#     --ts_out="${OUT_DIR}" \
#     ${PROTO_FILE}

protoc-gen-grpc \
    --js_out=import_style=commonjs,binary:${OUT_DIR} \
    --grpc_out=${OUT_DIR} \
    --proto_path ./ \
    ${PROTO_FILE}

# generate d.ts codes 
protoc-gen-grpc-ts \
    --ts_out=service=true:${OUT_DIR} \
    --proto_path ./ \
    ${PROTO_FILE}