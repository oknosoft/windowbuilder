#!/usr/bin/env bash

dirs=("wb_21_ram" "wb_21_doc")

host="http://admin:admin@localhost:5984"

for db in ${dirs[@]}
do
echo === $db ===
curl -X DELETE $host/$db
./couchdb-backup.sh -r -H $host -d $db -f $db.json -l 1000 -c
done
