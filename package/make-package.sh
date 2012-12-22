#!/bin/bash

pkgdir=`pwd`
cd `dirname $0`
cd ..
origdir=`pwd`

rm -v $pkgdir/*
zip -r -D -0 $pkgdir/package.zip * -x package/*
dver=`date +%y.%j.%k`
sed -e "s/DVER/$dver/" package/manifest.package > $pkgdir/manifest.package
