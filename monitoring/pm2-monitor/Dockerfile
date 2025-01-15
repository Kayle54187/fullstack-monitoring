FROM node:16-alpine

# Install git
RUN apk add --no-cache git

# Install pm2
RUN npm install -g pm2

# Clone the pm2-prometheus-exporter repository
RUN git clone https://github.com/saikatharryc/pm2-prometheus-exporter.git /app

# Set working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Expose the port for pm2-metrics (default is 9292)
EXPOSE 9209

# Start pm2-metrics using pm2
CMD ["pm2-runtime", "start", "exporter.js", "--name", "pm2-metrics"]
