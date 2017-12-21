#!/bin/bash

if [ $# -lt 3 ];
then
  echo "Usage: $(basename $0) <DB_HOST> <DB_USER> <DB_NAME> [<DB_PASS>]" && exit 1
fi

if [ $# -eq 3 ];
then
  echo -n "DB password: "
  read -s DB_pass
else
  DB_pass=$4
fi

DB_host=$1
DB_user=$2
DB=$3

test -d $DB || mkdir -p $DB

echo
echo "Dumping tables into separate SQL command files for database '$DB'"

tbl_count=0

for t in $(mysql -NBA -h $DB_host -u $DB_user -p$DB_pass -D $DB -e 'show tables')
do
  echo "DUMPING TABLE: $t"
  mysqldump --compact --no-data -h $DB_host -u $DB_user -p$DB_pass $DB $t | sed 's/ AUTO_INCREMENT=[0-9]*//g' | sed -e 's/DEFINER[ ]*=[ ]*[^*]*\*/\*/' > $DB/$t.sql
  (( tbl_count++ ))
done

echo "$tbl_count tables dumped from database '$DB'"
