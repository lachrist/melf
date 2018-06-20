rm /tmp/melf.sock
node ../server/bin.js --port /tmp/melf.sock --log &
SERVER_PID=$!
sleep 1
node alice.js /tmp/melf.sock &
sleep 1
node bob.js /tmp/melf.sock
kill $SERVER_PID