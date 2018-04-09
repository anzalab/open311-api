#!/bin/bash

# obtain ubuntu version
sudo lsb_release -a

# update ubuntu server
sudo apt-get update

# upgrade ubuntu server
sudo apt-get upgrade

# install curl, make, g++ and git
sudo apt-get install -y curl make g++ git

# install mongoose dev dependencies
sudo apt-get install -y libkrb5-dev

#
# install mongodb for Ubuntu 16.04
#
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
#
# import the public key used by the package management system
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5


# create a list file for MongoDB
# Ubuntu 16.04
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list


# reload local package database
sudo apt-get update

# install the latest stable version of MongoDB
sudo apt-get install -y mongodb-org

# start mongodb service
sudo service mongod start


sudo vi /lib/systemd/system/mongod.service

[Unit]
Description=High-performance, schema-free document-oriented database
After=network.target
Documentation=https://docs.mongodb.org/manual

[Service]
User=mongodb
Group=mongodb
ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf

[Install]
WantedBy=multi-user.target

sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod


#
# Install redis
# https://www.digitalocean.com/community/tutorials/how-to-install-and-use-redis
#

# add repository
sudo add-apt-repository ppa:chris-lea/redis-server

# reload local package database
sudo apt-get update

# install redis server
sudo apt-get install -y redis-server

#
# install nodejs and global dependencies
#
# install node version manager
# curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash


# ensure nvm changes made to your path are actually reflected
#source ~/.profile

# install the latest available e.g nvm install 0.12.x release of nodejs
# installed v0.12.14
nvm install 7.7.4

# set default nodejs version
nvm alias default 7.7.4

# install PM2
npm install pm2 -g

# enable node to run in port 80
sudo apt-get install -y libcap2-bin

#sudo setcap cap_net_bind_service=+ep /usr/local/bin/node
# if you have install node using nvm try below command
sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``


## set static ip address on local ubuntu server
# auto <iface>
# iface <iface> inet static
# address <ip>
# netmask <net mask>
# gateway <gateway>
# dns-nameservers <dns server>
