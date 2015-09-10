# node-data-parse-example
A very simple example of parsing data in a file using node.js

# What is this?
I wanted to explore the London Stock Exchange's [1000 Companies to Inspire Britain 2015](http://www.lseg.com/resources/1000-companies-inspire-britain/2015). 

After pulling the list of companies from the report (PDF), I wanted to get the data into Excel where I could play around with it.

The code here is a quick 'n' dirty *node.js* application which reads a raw data file, turns it into a set of javascript objects, then write both JSON and CSV to the filesystem.

It was developed in [Cloud9 IDE](https://ide.c9.io).
