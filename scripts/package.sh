#!/bin/sh

set -xe

inDir=./node_modules
outDir=./src/vendor


mkdir -p $outDir/video.js
cp $inDir/video.js/dist/video.min.js $outDir/video.js/video.min.js
cp $inDir/video.js/dist/video-js.min.css $outDir/video.js/video.min.css

mkdir -p $outDir/hls.js
cp $inDir/hls.js/dist/hls.min.js $outDir/hls.js/hls.min.js

mkdir -p $outDir/skeleton.css
cp $inDir/skeleton-css/css/skeleton.css $outDir/skeleton.css/skeleton.css
cp $inDir/skeleton-css/css/normalize.css $outDir/skeleton.css/normalize.css