#!/bin/bash

DISPLAY=":0"
export DISPLAY


#XVFB_TASKS=`ps aux | grep Xvfb | grep -v grep |  awk '{print $2}'`
#echo $XVFB_TASKS
#kill -9 $XVFB_TASKS
#echo ""
#sleep 1

#BROWSER_TASKS=`ps aux | grep chromium-browser | grep -v grep |  awk '{print $2}'`
#echo $BROWSER_TASKS
#kill -9 $BROWSER_TASKS
#echo ""
#sleep 1

#Xvfb $DISPLAY -ac > /tmp/Xvfb.log 2>&1 &
#sleep 1

#xvfb-run --server-args="-screen 0 1024x768x24" chromium-browser &
#sleep 1

# from a cam
#gst-launch-1.0 -v -e \
# v4l2src device=/dev/video0 !  \
# "image/jpeg,width=1280,height=720,type=video,framerate=30/1" ! \
# jpegdec ! \
# videoscale ! \
# "video/x-raw,width=1920,height=1080,method=9" ! \
# clockoverlay text="TC:" halignment=center valignment=bottom shaded-background=true shading-value=255 font-desc="Sans 10" ! \
# textoverlay text="Second Cam" valignment=bottom halignment=left shaded-background=true shading-value=255 font-desc="Sans, 10" ! \
# textoverlay text="/dev/video1" valignment=bottom halignment=right shaded-background=true shading-value=255 font-desc="Sans, 10" ! \
# nvvidconv ! \
# "video/x-raw(memory:NVMM),format=NV12,width=1920,height=1080,framerate=30/1" ! \
# nvv4l2vp8enc bitrate=4800000 maxperf-enable=1 preset-level=4 vbv-size=360000000 peak-bitrate=6000000 control-rate=0 ratecontrol-enable=1  ! \
# webmmux streamable=1 min-cluster-duration=100000000 max-cluster-duration=500000000 ! \
# shout2send ip=localhost port=8100 password=changeme mount=/desktop async=0


#gst-launch-1.0  -v -e \
# ximagesrc display-name=$DISPLAY startx=0 use-damage=0 ! 'video/x-raw,framerate=50/1' ! \
# nvvidconv ! "video/x-raw(memory:NVMM),format=NV12,width=1920,height=1080,framerate=50/1" ! \
# nvv4l2vp8enc maxperf-enable=1 preset-level=4 control-rate=0 ! \
# webmmux streamable=1 min-cluster-duration=100000000 max-cluster-duration=500000000 ! \
# shout2send ip=localhost port=8100 password=changeme mount=/desktop async=0

#gst-launch-1.0  -v -e \
# ximagesrc display-name=$DISPLAY startx=0 use-damage=0 ! 'video/x-raw,framerate=50/1' ! \
# alpha method=custom angle=20 target-r=230 target-g=0 target-b=35 black-sensitivity=100 white-sensitivity=100 ! \
# nvvidconv ! "video/x-raw(memory:NVMM),format=NV12,width=1920,height=1080,framerate=50/1" ! \
# nvv4l2vp8enc maxperf-enable=1 preset-level=0 control-rate=1 bitrate=10000000 iframeinterval=30 ! \
# webmmux streamable=1 min-cluster-duration=100000000 max-cluster-duration=500000000 ! \
# shout2send ip=localhost port=8100 password=changeme mount=/desktop async=0


TASK=`ps aux | grep Xvfb | grep -v grep |  awk '{print $2}'`
echo $TASK
kill -9 $TASK
echo ""
sleep 1

BROWSER_TASKS=`ps aux | grep chromium-browser | grep -v grep |  awk '{print $2}'`
echo $BROWSER_TASKS
kill -9 $BROWSER_TASKS
echo ""
sleep 1

/usr/bin/chromium-browser --window-size=1920,1080 --kiosk --window-position=0,0 http://localhost:8080 &

gst-launch-1.0  -v -e \
 ximagesrc display-name=$DISPLAY startx=0 use-damage=0 ! 'video/x-raw,framerate=50/1' !  \
 nvvidconv ! "video/x-raw(memory:NVMM),format=NV12,width=1920,height=1080,framerate=50/1" ! \
 nvv4l2vp8enc maxperf-enable=1 preset-level=0 control-rate=1 bitrate=10000000 iframeinterval=25 ! \
 webmmux streamable=1 min-cluster-duration=100000000 max-cluster-duration=500000000 ! \
 shout2send ip=localhost port=8100 password=changeme mount=/desktop async=0

. /data/node-jetson-webcam/desktop.sh