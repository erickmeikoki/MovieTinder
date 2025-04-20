#!/bin/bash

# Create sounds directory if it doesn't exist
mkdir -p public/sounds

# Download sound effects
curl -o public/sounds/swipe-right.mp3 "https://assets.mixkit.co/active_storage/sfx/2205/2205-preview.mp3"
curl -o public/sounds/swipe-left.mp3 "https://assets.mixkit.co/active_storage/sfx/2204/2204-preview.mp3"
curl -o public/sounds/like.mp3 "https://assets.mixkit.co/active_storage/sfx/1436/1436-preview.mp3"
curl -o public/sounds/save.mp3 "https://assets.mixkit.co/active_storage/sfx/2196/2196-preview.mp3"

echo "Sound effects downloaded successfully!" 