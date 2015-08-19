require 'sinatra/base'
require 'newrelic_rpm'

class YourAccount < Sinatra::Application
  enable :sessions, :logging
  set :root, File.dirname(__FILE__)

  set :app_prefix, '/yabeta'

  set :logging, Logger::DEBUG

  set :show_exceptions, false

  require_relative 'routes'

  # start the server if ruby file executed directly
  run! if app_file == $0
end
