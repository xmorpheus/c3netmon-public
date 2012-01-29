#!/bin/bash
WLCIP="127.0.0.1"
WLCCOMMUNITY="abcdefgh" 

clientsA=0
clientsG=0
clients24N=0
clients5N=0

data=$(snmpwalk -v 2c -c $WLCCOMMUNITY $WLCIP 1.3.6.1.4.1.14179.2.1.4.1.25|awk -F ':' '{ print $2 }')
for i in $data
do
	if test $i -eq 1; 
	then 
   		clientsA=$(echo $clientsA+1|bc)
	fi
	if test $i -eq 3;
	then
                clientsG=$(echo $clientsA+1|bc)
	fi
	if test $i -eq 6;
	then
                clients24N=$(echo $clients24N+1|bc)
	fi
	if test $i -eq 7;
	then
                clients5N=$(echo $clients5N+1|bc)
	fi
done
echo $clientsA:$clientsG:$clients24N:$clients5N
