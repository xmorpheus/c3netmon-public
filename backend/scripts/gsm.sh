sleep 2
wget -qO - 123.123.123.123:4223|python -mjson.tool|grep active| awk -F ': ' '{ print $2 }'|sed s/,//g
