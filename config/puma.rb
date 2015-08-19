daemonize

workers    2 # should be same number of your CPU core
#threads    1, 6

bind 'tcp://0.0.0.0:8080'

preload_app!

pidfile    "ya.pid"
