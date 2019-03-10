rm /tmp/melf-test.sock
node server.js /tmp/melf-test.sock &
pid=$!
sleep 1
node alice.js /tmp/melf-test.sock &
node bob.js /tmp/melf-test.sock
wait $pid