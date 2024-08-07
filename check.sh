#!/bin/bash

for i in $(ls **/mod.ts); do
    echo "checking $i"
    deno check $i
done