#!/usr/bin/env bash

dirs=("wb_21_ram" "wb_21_doc")

host="http://admin:admin@localhost:5984"

for db in ${dirs[@]}
do
echo === $db ===
./couchdb-backup.sh -b -H $host -d $db -f $db.json
done
