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
			BUCKET="preprod"
			;;

		--production )
			shift
			BUCKET="production"
			;;

		* ) shift;;
	esac
done

echo "Publishing to $BUCKET ..."

CDN_AUTH=$(echo $CDN_AUTH | base64 --decode)
USAT_AUTH=$(echo $USAT_AUTH | base64 --decode)
USCP_AUTH=$(echo $USCP_AUTH | base64 --decode)

# https://www.gannett-cdn.com/usat-storytelling/grid/{branch}/{slug}.json
CDN_SPACE="gs://usat-storytelling/grid/$BUCKET/uw"
PUBLIC_PATH="https://www.gannett-cdn.com/usat-storytelling/grid/$BUCKET/uw"

# FOR PURGING
CDN_PATH="https://$CDN_AUTH@www.gannett-cdn.com/usat-storytelling/grid/$BUCKET/uw"


# PROJECT_SLUG="$(basename $(pwd))"
PROJECT_FOLDER="./public/uw"

gsutil -m -o "GSUtil:parallel_process_count=1" rsync -r $PROJECT_FOLDER $CDN_SPACE

for filename in $(cd $PROJECT_FOLDER && find *); do
	echo "Purging $PUBLIC_PATH/$filename"

	# Purge the file/UW response
	curl -X PURGE "$CDN_PATH/$filename" &

	# Set expiry time for the files, so they aren't too cached.
	gsutil -o "GSUtil:parallel_process_count=1" -m setmeta -h "Cache-Control: max-age=10" "$CDN_SPACE/$filename"
done


# Add AllUsers:R to the project folder
gsutil -m acl ch -u AllUsers:R  -r "$CDN_SPACE"

wait
echo "Published cast of characters"
