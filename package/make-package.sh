#!/bin/bash

pkgdir=`pwd`
cd `dirname $0`
cd ..
origdir=`pwd`

rm -v $pkgdir/*
zip -r -D -0 $pkgdir/package.zip * -x package/{,.}*
dver=`date +%y.%j.%H`
pkgsize=`wc -c $pkgdir/package.zip | awk '{ print $1 }'`
sed -e "s/DVER/$dver/" -e "s/PKGSIZE/$pkgsize/" package/manifest.package > $pkgdir/manifest.package
cp package/.htaccess $pkgdir/
