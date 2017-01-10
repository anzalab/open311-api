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

# enable node to run in port 80
sudo apt-get install -y libcap2-bin
#sudo setcap cap_net_bind_service=+ep /usr/local/bin/node
# if you have install node using nvm try below command
sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``


#
# install mongodb
# 
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
# 
# import the public key used by the package management system
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

# create a list file for MongoDB
#echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list

# Ubuntu 14.04
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

# reload local package database
sudo apt-get update

# install the latest stable version of MongoDB
sudo apt-get install -y mongodb-org

# start mongodb service
sudo service mongod start


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
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash

# ensure nvm changes made to your path are actually reflected
#source ~/.profile

# install the latest available e.g nvm install 0.12.x release of nodejs
# installed v0.12.14
nvm install 7.2.1

# set default nodejs version
nvm alias default 7.2.1

# install PM2
npm install pm2 -g