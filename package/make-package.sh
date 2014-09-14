#!/bin/bash

pkgdir=`pwd`
cd `dirname $0`
cd ..
origdir=`pwd`

rm -v $pkgdir/*
zip -r -D -0 $pkgdir/package.zip * -x package/{,.}* *.appcache
dver=`date +%y.%j.%H`
pkgsize=`wc -c $pkgdir/package.zip | awk '{ print $1 }'`
sed -e "s/DVER/$dver/" -e "s/PKGSIZE/$pkgsize/" package/manifest.package > $pkgdir/manifest.package
sed -e "s/DVER/$dver/" -e "s/PKGSIZE/$pkgsize/" manifest.webapp > $pkgdir/manifest.webapp
cd $pkgdir
zip -f -0 package.zip manifest.webapp
rm manifest.webapp
cd $origdir
cp package/.htaccess $pkgdir/
