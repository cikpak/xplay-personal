# exit on any error
set -e

cd xplay-personal

echo "---Instaling Zerotier-One---"
# install zerotier
curl -s https://install.zerotier.com | bash 
echo "Success!"


#Install npm packages
echo "---Installing project dependencies---"
npm install
echo "Success!"


#create service
echo "---Creating xplay service---"
# create iperf service.
echo "[[Unit]
Description=XPlay-personal raspberry server
After=network.target

[Service]
Environment="PORT=8000"
Environment="WAIT_CONFIGURATION=10"
Environment="XBOX_POWER_ON_TRIES=10"
Type=simple
User=pi
ExecStart=/usr/bin/node /home/pi/xplay-personal/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/xplay-server.service

echo "Success!"



# enable & start service
echo "---Enabling and starting XPlay service---"
sudo systemctl enable xplay-server.service && sudo systemctl start xplay-server.service
echo "Success!"
