# this runs in jenkins

install:
	npm ci

build:
	npm run static
	npm run build

preview:
	npm run preview

update:
	npm run data

deploy-dev: 
	./functions/deploy.sh
	
deploy-preprod: 
	./functions/deploy.sh --preprod
	
deploy-production: 
	./functions/deploy.sh --production

dev: 
	TARGET="dev" ./functions/publish.sh

preprod:
	TARGET="preprod" ./functions/publish.sh --preprod

publish:
	TARGET="production" ./functions/publish.sh --production

uw: 
	rm -rf ./public/uw/*.json
	mkdir -p ./public/uw
	node ./functions/ssr.js

test:
	npm run test

cache:
	node functions/cache.js

riot:
	CAST_PROJECT="jan-6-riots" make update preview build

title: 
	CAST_PROJECT="title-ix" make update preview

palm: 
	CAST_PROJECT="florida-election-endorsements-2022" make update preview

index: 
	CAST_PROJECT="cast-of-characters-index" make update preview

worldcup:
	CAST_PROJECT="world-cup-qatar-2022-men-roster" make update preview 

testproject:
	CAST_PROJECT="test-development-project" make update preview 
