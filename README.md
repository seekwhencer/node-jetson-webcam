# node-jetson-webcam

With this you can run multiple webcams on a jetson nano dev. simplified.

## Setup

Install gstreamer:

```
sudo add-apt-repository universe
sudo add-apt-repository multiverse
sudo apt-get update
sudo apt-get install gstreamer1.0-tools gstreamer1.0-alsa gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav
sudo apt-get install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-good1.0-dev libgstreamer-plugins-bad1.0-dev 
sudo apt-get install libgstrtspserver-1.0-0 libgstrtspserver-1.0-dev
```

Install Node

```
curl -L https://git.io/n-install | bash
```

Exit and reopen the console or source it:
```
. ~/.bashrc
```

Create a folder
```
sudo mkdir /data
sudo chown $USER:$GROUP /data
```

Get the repo:
```
cd /data
git clone https://github.com/seekwhencer/node-jetson-webcam.git
npm install
```
Run it
```
npm run dev
```
