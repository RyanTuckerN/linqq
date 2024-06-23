#!/bin/bash

current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "You must be on the main branch to deploy the documentation site."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "There are changes in the main branch. Please commit or stash them before deploying."
  exit 1
fi

echo "Building the Docusaurus site..."
cd doc
if ! npm run build; then
  echo "Build failed. Deployment aborted."
  exit 1
fi
cd ..

echo "Copying build files to gh-pages worktree..."
cp -r doc/build/* gh-pages/

echo "Deploying to GitHub Pages..."
cd gh-pages
git add .
if git commit -m "Update documentation site"; then
  git push origin gh-pages
  echo "Deployment complete!"
else
  echo "No changes to commit. Deployment skipped."
fi

cd ..
git checkout main