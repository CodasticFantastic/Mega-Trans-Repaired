#Initializing Command    
# docker build . -t TAG-NAME

#Docker run command   
# docker run -dp 3000:3000 nextjs-megatrans-cms-system

# Docker run with low privileges user and block privileged mode
#  docker run --read-only -u jakub -it --rm --security-opt="no-new-privileges" 36bd8cad53e2 /bin/bash

FROM node:current-slim

LABEL maintainer="Jakub Wojtysiak <it.jakub.wojtysiak@gmail.com>"

# Add low privileges user
RUN groupadd -r jakub && useradd -r -g jakub jakub

#  Completely block root shell
RUN chsh -s /usr/sbin/nologin root
# RUN echo "root:password" | chpasswd - Command to set root password

WORKDIR /app

COPY . . 

RUN apt update -y && apt upgrade -y 
RUN apt install -y openssl
RUN npm install -y
RUN npm run build
RUN npx prisma migrate deploy
RUN rm -f .env

EXPOSE 3000
USER jakub
CMD ["npm", "run", "start"]

# Environment Variables
ENV HOME /home/jakub
ENV DEBIAN_FRONTEND=noninteractive