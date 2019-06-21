# Webrick was failing to long URIs coming from blockstack's authentication
require 'webrick'
::WEBrick::HTTPRequest.const_set("MAX_URI_LENGTH", 10240)

configure :development do
  config[:host] = "http://localhost:3000"
end

configure :build do
  config[:host] = "http://envelop.app"
  activate :asset_hash, exts: %w(.css .js)
end

# Per-page layout changes

page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# Include special files (Middleman ignores .dotfiles)

ready do
  proxy '.well-known/assetlinks.json', 'well-known/assetlinks.json', ignore: true
end

# Helpers

helpers do
  def placeholder_image_tag(options = {})
    data_path = { path: '/' + config[:images_dir] }
    if options[:data]
      options[:data].merge!(data_path)
    else
      options.merge!({ data: data_path })
    end
    options[:src] = nil
    image_tag(nil, options)
  end
end

# Asset configuration

activate :external_pipeline,
  name: :webpack,
  command: build? ? "PREVIEW=#{ENV['PREVIEW']} npm run build" : 'npm run start',
  source: '.tmp/dist',
  latency: 1

config[:assets_dir] = 'assets/javascripts'
config[:css_dir] = 'assets/stylesheets'
