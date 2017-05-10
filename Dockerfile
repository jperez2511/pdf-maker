
FROM node:latest
LABEL Name=pdf-maker Version=0.1.0 
RUN mkdir app
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
