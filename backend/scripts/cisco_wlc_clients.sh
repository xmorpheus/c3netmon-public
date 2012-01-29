#!/bin/bash
WLCIP="127.0.0.1"
WLCCOMMUNITY="abcdefgh" 

clients=0
data=$(snmpwalk -v 2c -c $WLCCOMMUNITY $WLCIP .1.3.6.1.4.1.14179.2.1.1.1.38|awk -F ':' '{ print $2 }')
for i in $data
do
   clients=$(echo $clients+$i|bc)
done
echo $clients
