#!/bin/bash

[ $# -lt 1 ] && echo "Usage: $(basename $0) <DB_NAME>" && exit 1

DB=$1

echo "Creating initial dump script for '$DB'"

cat <(echo "SET FOREIGN_KEY_CHECKS=0;") > fresh_deploy_$DB.sql

cat <(echo "CREATE DATABASE $DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;;") >> fresh_deploy_$DB.sql

cat <(echo "USE $DB;") >> fresh_deploy_$DB.sql

FILES=$DB/*.sql
for f in $FILES
do
  if [ "$f" == "$DB/RefData.sql" ]
  then
    continue;
  fi
  echo "Processing $f..."
  cat $f >> fresh_deploy_$DB.sql
done
