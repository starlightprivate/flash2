FROM node:7.7.2

# Build node_modules - they will be cached - they are changing more slowly than source code of `node-api`
RUN mkdir -p /src/app
ADD package.json /src/app/package.json
WORKDIR /src/app
RUN npm install

# Add source code of `node-api`
ADD . /src/app

# Run build scripts for frontend
RUN npm run-script frontend

EXPOSE 8000

# Save git revision id in `public/build.txt`
RUN git log --format='%h' -n 1 > public/buildId.txt
RUN git log -n 5 > public/build.txt

CMD ["npm","start"]
