FROM redis:3.2.8
ADD redis.conf /etc/redis.conf

# mountable directories
VOLUME ["/data"]

# working directory
WORKDIR /data

# default command
CMD ["redis-server", "/etc/redis.conf"]

# expose ports
EXPOSE 6379
