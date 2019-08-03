# node-jetson-webcam

With this you can run multiple webcams on a jetson nano dev. simplified.

## Setup

Install gstreamer:

```
sudo add-apt-repository universe
sudo add-apt-repository multiverse
sudo apt-get update
sudo apt-get install gstreamer1.0-tools gstreamer1.0-alsa gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav -y
sudo apt-get install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-good1.0-dev libgstreamer-plugins-bad1.0-dev -y 
sudo apt-get install libgstrtspserver-1.0-0 libgstrtspserver-1.0-dev -y
sudo apt-get install curl make htop ffmpeg v4l-utils icecast2 -y
sudo apt-get upgrade -y
```

Install Node

```
curl -L https://git.io/n-install | bash
```

Exit and reopen the console or source it:
```
. ~/.bashrc
```

Change node.js version to 12
```
n 12
```

Create a folder
```
sudo mkdir /data
sudo chown MYUSER /data
```

Get the repo:
```
cd /data
git clone https://github.com/seekwhencer/node-jetson-webcam.git
cd node-jetson-webcam
npm install
```
## Run it
```
npm run dev
```

## Configure
Edit the default config in: `config/default.conf`  

```bash
[global]
name=My funky webcam controller

[api]
host=127.0.0.1
port=8100

[camera]
device=/dev/video1
name=default camera
bin=/usr/bin/gst-launch-1.0
ffmpeg_bin=/usr/bin/ffmpeg
width=1920
height=1080
framerate=30
quality=100
caps_delay=2000
ready_delay=2000
mode=tcp
inputformat=YUY2

[camera_1]
device=/dev/video0
name=First Cam
port=5100

[camera_2]
device=/dev/video2
name=Second Cam
port=5200
```

check the webcam devices:
```
ls -la /dev/video*
```
... and edit the config

## Playback
open `tcp://jetson-ip-or-name:5100`  
replace the name or use the ip and chose a port

## API
open `http://jetson-ip-or-name:8080/v1` 
___
#### `/`
get the camera properties
___
#### `/{camera_id}/record`
save recording on disk
___
#### `/{camera_id}/stop`
stop recording
___

