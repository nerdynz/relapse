# Path to this plugin
PROTOC_GEN_TS_PATH="/Users/jaybeecave/.nvm/versions/node/v14.15.4/bin/protoc-gen-ts"

# Directory to write generated code to (.js and .d.ts files)
OUT_DIR="../app/src/grpc"

protoc \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="${OUT_DIR}" \
    relapse.proto