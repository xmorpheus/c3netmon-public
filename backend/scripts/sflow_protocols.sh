#!/bin/bash
wget -qO - http://sflow_host/dashboard|tail -1|awk -F ' ' '{ print $3 ":" $4 }'
