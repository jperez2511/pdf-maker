FROM yukinying/chrome-headless

RUN apt-get update -qq \
  && apt-get install -qq \
    fonts-roboto \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*
