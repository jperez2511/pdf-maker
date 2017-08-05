FROM justinribeiro/chrome-headless
USER root
RUN apt-get update && apt-get install -qq \
    fonts-roboto
USER chrome
CMD [ "--headless", "--disable-gpu", "--hide-scrollbars", "--remote-debugging-address=0.0.0.0", "--remote-debugging-port=9222" ]