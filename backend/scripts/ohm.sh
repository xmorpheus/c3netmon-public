if [ "$1" = "shadow" ]
then
	wget -qO - http://camp.x23.nu/values.php|awk -F ',' '{ print $1 }'
else
	wget -qO - http://camp.x23.nu/values.php|awk -F ',' '{ print $2 }'
fi
