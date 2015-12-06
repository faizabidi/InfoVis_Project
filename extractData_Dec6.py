import csv
import re
from datetime import datetime

lst = list()

#read a file
inp = raw_input('Enter a file:')
try:
	if len(inp)<1: inp = 'test-students-2005-2015.txt'
	file = open(inp)
except:
	print 'File not found'
	exit()

#read and divide each line in the file
for i in file:
	i = i.strip()
	i = i.split(',')
	
	record = i[0]
	record = record[1:-1]
	
	title = i[1]
	title = title[1:-1]
	
	author = i[2]
	author = author[1:-1]
	
	pubinfo = i[3]
	pubinfo = pubinfo[1:-1]
	
	callnum = i[4]
	callnum = callnum[1:-1]
	#call = callnum[0:2]

	odate = i[5]
	odate = odate[1:-1]
	
	rdate = i[6]
	rdate = rdate[1:-1]
	rdate = rdate.replace('/','-')
	if (rdate =='') : rdate = '-'
	
	fund = i[7]
	fund = fund[1:-1]
	if (fund == '') : fund = '-' 
	
	totcheckout = i[8]
	totcheckout = totcheckout[1:-1]
	
	ldate = i[9]
	ldate = ldate[1:-1]
	
	lst.append((record,title,author,pubinfo,callnum,odate,rdate,fund,totcheckout,ldate))
		
with open("processed_2005_2015_faiz_dec6.csv", "wb") as myfile:
	wr = csv.writer(myfile)
	wr.writerows(lst)	