rm /tmp/melf-test.sock
node server.js /tmp/melf-test.sock &
PID=$!
sleep 1
node alice.js /tmp/melf-test.sock &
node bob.js /tmp/melf-test.sock
kill $PID