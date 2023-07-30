#Initializing Command    
# docker build -t nextjs-megatrans-cms-system .

#Docker run command   
# docker run -dp 3000:3000 nextjs-megatrans-cms-system

FROM node:20-slim

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "run", "start:dev:prod" ]

