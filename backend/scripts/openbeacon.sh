#!/bin/bash
wget -q -O - http://open_beacon_tracking_host/tracking.json|grep '"id":'|grep -v floor|wc -l
