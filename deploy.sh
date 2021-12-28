#!/usr/bin/env sh
# abort on errors

set -e

npm run build   # build
cd dist         # navigate into the build output directory

git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:raudius/printlet.git master:gh-pages

cd -