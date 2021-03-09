echo | sudo su

while [[ "$#" -gt 0 ]]
do
  case $1 in
    -x|--xbox-ip)
      xbox_ip=$2
      ;;
    -s|--src-ip)
      src_ip=$2
      ;;
    -l|--lan-ip)
      lan_ip=$2
      ;;
    -z|--zt-ip)
      zt_ip=$2
      ;;
  esac
  shift
done
if [ -z $xbox_ip ]; then echo -x / --xbox-ip empty; exit 1; fi
if [ -z $src_ip ];  then echo -s / --src-ip empty;  exit 1; fi
if [ -z $lan_ip ];  then echo -l / --lan-ip empty;  exit 1; fi
if [ -z $zt_ip ];   then echo -z / --zt-ip empty;   exit 1; fi

#echo $xbox_ip
#echo $src_ip
sudo iptables -F -t nat
sudo iptables -F
sudo iptables -t nat -p tcp -A PREROUTING  -s $src_ip  -d $zt_ip  ! --dport 8000 -j DNAT --to $xbox_ip
sudo iptables -t nat -p udp -A PREROUTING  -s $src_ip  -d $zt_ip                 -j DNAT --to $xbox_ip
sudo iptables -t nat        -A PREROUTING  -s $xbox_ip -d $lan_ip                -j DNAT --to $src_ip
#iptables -p tcp -A FORWARD     -d $zt_ip  --dport 1880 -j REJECT
#iptables        -A FORWARD     -d $zt_ip               -j ACCEPT
sudo iptables -t nat        -A POSTROUTING -s $src_ip  -d $xbox_ip               -j SNAT --to $lan_ip
sudo iptables -t nat        -A POSTROUTING -s $xbox_ip -d $src_ip                -j SNAT --to $zt_ip
