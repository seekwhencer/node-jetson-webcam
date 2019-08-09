#!/bin/bash

DISPLAY=":1"

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

gst-launch-1.0  -v -e \
 ximagesrc display-name=$DISPLAY startx=0 use-damage=0 ! 'video/x-raw,framerate=50/1' \
 ! nvvidconv ! "video/x-raw(memory:NVMM),format=NV12,width=1920,height=1080,framerate=50/1" \
 ! nvv4l2vp8enc maxperf-enable=1 preset-level=4 control-rate=0 \
 ! webmmux streamable=1 min-cluster-duration=100000000 max-cluster-duration=500000000 \
 ! shout2send ip=localhost port=8100 password=changeme mount=/desktop async=0

. ./desktop.sh