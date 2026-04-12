#!/bin/bash
DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$DATE] Iniciando limpieza de logs..."
find ~/logs -name "*.log" -mtime +7 -delete 2>/dev/null
echo "[$DATE] Limpieza completada."
