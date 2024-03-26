#!/bin/bash

# Delete the report.txt file (if it exists)
rm accessibility-report.txt 2> /dev/null

# Point to the JavaScript file
node run-pa11y.js