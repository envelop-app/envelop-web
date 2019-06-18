# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

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
  command: build? ? 'npm run build' : 'npm run start',
  source: '.tmp/dist',
  latency: 1

config[:assets_dir] = 'assets/javascripts'
config[:css_dir] = 'assets/stylesheets'
