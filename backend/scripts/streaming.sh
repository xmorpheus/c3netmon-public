wget -qO - http://tv.nifhack.nl/stream_stats/listeners.json|grep '}' -P1|head -1|awk -F ': ' '{ print $2 }'|sed s/','//g
