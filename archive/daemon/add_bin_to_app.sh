go build
chmod 777 daemon
mv daemon ../desktop/src/bin/daemon

swiftc screeninfo.swift -o screeninfo
cp screeninfo ../desktop/src/bin/screeninfo