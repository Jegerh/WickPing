#!/bin/bash
cd /var/app/current/frontend

# Set correct ownership
sudo chown -R webapp:webapp .

# Run commands as webapp user
sudo -u webapp yarn install
sudo -u webapp yarn build