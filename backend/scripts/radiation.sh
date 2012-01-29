#!/bin/bash
wget -qO - http://host_with_geiger_data/geiger_poc.rad|awk -F 'cpm=' '{ print $2 }'|sed 's/;//'
