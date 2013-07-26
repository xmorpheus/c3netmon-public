#!/bin/bash
ROUTERIP="123.123.123.123";
ROUTERCOMMUNITY="abcdef"

snmpget -v2c -c $ROUTERCOMMUNITY $ROUTERIP .1.3.6.1.4.1.22610.2.4.3.18.4.1.2.0|awk -F ': ' '{ print $2 }'

