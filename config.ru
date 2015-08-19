require 'rubygems'
require 'bundler'

Bundler.require

require 'sass/plugin/rack'
Compass.add_project_configuration(File.join(File.dirname(__FILE__), 'config', 'compass.rb'))
Compass.configure_sass_plugin!
Sass::Plugin.options[:sourcemap] = :auto
use Sass::Plugin::Rack

require './app'
run YourAccount