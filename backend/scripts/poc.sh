#!/bin/bash
# 28c3 was 'http://www.eventphone.de/guru2/phonebook?event=28C3&s=&installedonly=1&page=1&format=xml'
wget -q -O - 'http://poc_data/xml'|grep extension|wc -l
