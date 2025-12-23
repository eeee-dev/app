#!/bin/bash
lftp -c "
open ftp://ftp.eeee.mu
user u384688932.david poupS123*
cd /public_html/office
put -O . dist/index.html
bye
"
