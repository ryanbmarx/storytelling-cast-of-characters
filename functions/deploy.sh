#!/usr/bin/env sh

set -e

# staging or production?
BUCKET="dev"
while [ "$1" != "" ]; do
	case $1 in
		--staging )
			shift
			BUCKET="dev"
			;;

		--preprod )
			shift
			BUCKET="production"
			;;

		--production )
			shift
			BUCKET="production"
			;;

		* ) shift;;
	esac
done

echo "Deploying to $BUCKET ..."

CDN_AUTH=$(echo $CDN_AUTH | base64 --decode)
USAT_AUTH=$(echo $USAT_AUTH | base64 --decode)
USCP_AUTH=$(echo $USCP_AUTH | base64 --decode)


CDN_SPACE="gs://usat-storytelling/grid/$BUCKET"
PUBLIC_PATH="https://www.gannett-cdn.com/usat-storytelling/grid/$BUCKET"
CDN_PATH="https://$CDN_AUTH@www.gannett-cdn.com/usat-storytelling/grid/$BUCKET"

PROJECT_FOLDER="./public"


gsutil -m -o "GSUtil:parallel_process_count=1" rsync $PROJECT_FOLDER $CDN_SPACE

for filename in $(cd $PROJECT_FOLDER && find *); do
	echo "Purging $filename"

	# Purge the file/UW response
	curl -X PURGE "$CDN_PATH/$filename" &
done

# Add AllUsers:R to the project folder
gsutil -m acl ch -u AllUsers:R  -r "$CDN_SPACE"

wait
echo "Deployed cast of characters"
