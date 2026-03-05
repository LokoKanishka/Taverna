#!/bin/bash
# Script de recuperación rápida para la doctora Lucy

echo "Deteniendo contenedor lucy_sillytavern..."
docker rm -f lucy_sillytavern

echo "Iniciando contenedor con puertos corregidos para el orquestador..."
docker run -d --name lucy_sillytavern \
    -v /home/lucy-ubuntu/Escritorio/Taverna/SillyTavern/data:/home/node/app/data \
    -v /home/lucy-ubuntu/Escritorio/Taverna/SillyTavern/plugins:/home/node/app/plugins \
    -v /home/lucy-ubuntu/Escritorio/Taverna/SillyTavern/config.yaml:/home/node/app/config.yaml \
    -p 8000:8123 \
    ghcr.io/sillytavern/sillytavern:latest

echo "Esperando que el contenedor levante para inyectar los parches de seguridad de la API..."
sleep 5

echo "Inyectando parches..."
docker cp /home/lucy-ubuntu/Escritorio/Taverna/SillyTavern_Patches/whitelist.js lucy_sillytavern:/home/node/app/src/middleware/whitelist.js
docker cp /home/lucy-ubuntu/Escritorio/Taverna/SillyTavern_Patches/users.js lucy_sillytavern:/home/node/app/src/users.js
docker cp /home/lucy-ubuntu/Escritorio/Taverna/SillyTavern_Patches/server-main.js lucy_sillytavern:/home/node/app/src/server-main.js

echo "Reiniciando el contenedor para aplicar los bypass..."
docker restart lucy_sillytavern

echo "¡Taverna parcheada y lista para recibir comandos del orquestador!"
