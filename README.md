# node-jetson-webcam

With this you can run multiple webcams on a jetson nano dev. simplified.

## Setup

- Install gstreamer:

```
sudo add-apt-repository universe
sudo add-apt-repository multiverse
sudo apt-get update
sudo apt-get install gstreamer1.0-tools gstreamer1.0-alsa gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav -y
sudo apt-get install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-good1.0-dev libgstreamer-plugins-bad1.0-dev -y 
sudo apt-get install curl make htop ffmpeg v4l-utils icecast2 -y
sudo apt-get upgrade -y
```

- Install Node

```
curl -L https://git.io/n-install | bash
```

- Exit and reopen the console or source it:
```
. ~/.bashrc
```

- Change node.js version to 12
```
n 12
```

- Create a folder
```
sudo mkdir /data
sudo chown MYUSER:MYUSER /data
```
replace `MYUSER` with your own. getting: `echo $USER`
 
- Get the repo:
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
 
The `[camera]` and the `[camercontrols]` element is the property set of all cameras. `[camera_1]` and `[camera_2]` override things from `[camera]` and `[cameracontrols]`.
 
check the webcam devices:
```
ls -la /dev/video*
```
... and edit the config

## Steam Configuration
Edit these config fields for all or a specific camera:
```ini
[camera]
source=mjpeg
encoder=vp8
overlay=clock,name,device
output=icecast
```
- `source` can be: `mjpg` or `h264` or `raw`  
- `encoder` can be: `vp8` or `h264`  
- `overlay` can be: `clock,name,device` or less of them, comma separated  
- `output` can be: `tcp` or `icecast`  

## Camera Capabilities
Check if your cam supports the given source properties. At the moment it is:
```
mjpeg
30 fps
1280 x 720
```
This is important! If you give wrong capabilities to `width_from`, `height_from`, `framerate_from` or `width`,`height`,`framerate` (if no `_from` property was set).
Check the capabilities of your cam. `v4l2-ctl --list-formats -d /dev/video0` - replace `video0` with your device.


## Playback
Two ways of streaming:
 
1) per tcp directly from gstreamer
2) per http from icecast2

open `tcp://jetson-ip-or-name:5100`  
or: `http://jetson-ip-or-name:8100/one`  
replace the name or use the ip and chose a port

## API
open `http://jetson-ip-or-name:8080/v1` 
___
### All Cameras
#### **GET**`/cameras`
get all cameras
___
#### **GET**`/cameras/record`
start recording for all cameras
___
#### **GET**`/cameras/stop`
stop recording for all cameras
___
#### **GET**`/cameras/snapshot`
make a snapshot
___

### One Camera
#### **GET**`/camera/{camera_id}`
get one camera
___
#### **GET**`/camera/{camera_id}/record`
save recording on disk
___
#### **GET**`/camera/{camera_id}/stop`
stop recording
___
#### **GET**`/camera/{camera_id}/snapshot`
make a snapshot
___
#### **GET** `/camera/{camera_id}/controls`
get the camera controls (brightness, contrast etc.)
___
#### **POST** `/camera/{camera_id}/controls`
set the camera controls (brightness, contrast etc.)  
multipart form, any property equals a form field
___
#### **POST** `/camera/{camera_id}/controls/reset`
reset to the defaults from config file
___

## Desktop Streaming
It is possible to stream the ubuntu gnome desktop - and, if you let it run: a fullscreen browser.
I suggest the `chromium browser`. Simply start the desktop, open a shell, go into the app folder
and run: `./desktop.sh`.  
  
`desktop.sh` is actually the simplest way to send the desktop view as stream to the icecast server.
But you need to run the script from a terminal from open gnome session - not over SSH.
You can reach the desktop stream: `http://jetson-ip-or-hostname:8100/desktop` !
  
`desktop.sh` needs the running node app and the running icecast2 server.

### Autostart with the desktop - or: "the kiosk mode"

- edit, replace MYUSER  
    ```
    nano ~/.config/autostart/MYUSER.desktop
    ```  
- use this:
    ```
    [Desktop Entry]
    Type=Application
    Name=Node Jetson Webcam Desktop Stream
    Exec=gnome-terminal -e /data/node-jetson-webcam/desktop.sh
    X-GNOME-Autostart-enabled=true
    ```

Set autologin to your user. Check the user settings....

### Auto start the node app
- install `pm2` globally
```
npm install pm2 -g
```
- apply as service
```
pm2 startup
```
- follow the instructions from pm2 and execute the given commands as sudo
- let pm2 start the app
```
cd /data/node-jetson-webcam
pm2 start "npm run dev" --name "node-jetson-webcam"
pm2 save
```
- starting, stopping
```
pm2 stop 0
pm2 start 0
```
`0` is the pm2 app id.
- get status
```
pm2 status
pm2 status 0
```
- logs
```
pm2 logs 0
```

## Summary:
At the moment the Icecast Stream is stable as hell with a latency of a second or less.
Tested over a 300 MBit/s Wifi Network and played with VLC on a Windows Platform.
The browser playback in firefox lags a little bit. I don't know why.
  
The key for a stable and fluid stream was this f***** properties for the webmmuxer: `min-cluster-duration` and `max-cluster-duration`
 
Sharpness: with a cheap webcam under 100 € you have a maximum focus range with the lens of the webcam.
This means you can't focus things far far away. The maximum is somewhere at 5 meters ?
The normal use case of a webcam is to make a skype call or something. These use cases needs a low focus range.
 
To hack your webcam, open the cam and rotate the lens with a pliers.
BUT: be careful and make a little mark on the lens ring and the fixed holder to turn it back later.
That sounds funny? It is.