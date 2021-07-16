docker-compose build --force-rm
docker-compose down
docker-compose up -d
docker rmi $(docker images -f "dangling=true" -q)
