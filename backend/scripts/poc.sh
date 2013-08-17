#!/bin/bash
# 28c3 was 'http://www.eventphone.de/guru2/phonebook?event=OHM2013&s=&installedonly=1&page=1&format=xml'
wget -q -O - 'http://www.eventphone.de/guru2/phonebook?event=OHM2013&s=&installedonly=1&page=1&format=xml'|grep extension|wc -l
