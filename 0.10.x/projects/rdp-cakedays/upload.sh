#!/bin/bash
devvit upload
devvit update rdp-cakedays flyinglaserturtle
devvit logs flyinglaserturtle | grep -v VERBOSE
