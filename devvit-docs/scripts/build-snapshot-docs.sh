#!/usr/bin/env sh

set -${V:+x}eu

scriptDir="$(realpath "$(dirname "$0")")"

cd $scriptDir
node writeSnapshotSchemas.js
echo "Generate Snapshot schema docs from schemas in dw-airflow"
