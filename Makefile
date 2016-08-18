.PHONY: deploy


all:
	tsc

deploy: all
	cp build/*.js deploy/build/
	cp *.html deploy/