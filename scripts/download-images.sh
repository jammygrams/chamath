#!/bin/bash

# Create the public directory if it doesn't exist
mkdir -p public

# Download images for each person
# Chamath's image is already there (chamath_cropped.png)

# David Sacks
curl -o public/david_sacks.png https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/David_O._Sacks_at_TechCrunch_Disrupt_NY_2016_-_Day_3_%2826889955082%29_%28cropped%29.jpg/440px-David_O._Sacks_at_TechCrunch_Disrupt_NY_2016_-_Day_3_%2826889955082%29_%28cropped%29.jpg

# Jason Calacanis
curl -o public/jason_calacanis.png https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Jason_Calacanis_2012_Shankbone.JPG/440px-Jason_Calacanis_2012_Shankbone.JPG

# Brad Gerstner
curl -o public/brad_gerstner.png https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Brad_Gerstner_at_Code_Conference_2022_%28cropped%29.jpg/440px-Brad_Gerstner_at_Code_Conference_2022_%28cropped%29.jpg

echo "Images downloaded successfully!" 