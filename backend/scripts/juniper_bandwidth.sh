#!/bin/bash
ROUTERIP="127.0.0.1"
ROUTERCOMMUNITY="asdf"
ROUTERINT="1"

if [ "$1" = "down" ]; then
	snmpget -c $ROUTERCOMMUNITY $ROUTERIP -v 2c iso.3.6.1.2.1.31.1.1.1.6.$ROUTERINT|awk -F ':' '{ print $2 }'
fi
if [ "$1" = "up" ]; then
	snmpget -c $ROUTERCOMMUNITY $ROUTERIP -v 2c iso.3.6.1.2.1.31.1.1.1.10.$ROUTERINT|awk -F ':' '{ print $2 }'
fi

