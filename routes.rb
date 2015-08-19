class YourAccount < Sinatra::Application

  include TplwsClient::Account::Users
  include TplwsClient::Account::Holds
  include TplwsClient::Account::Checkouts
  include TplwsClient::Account::Charges

  TPLWS_URL = 'http://tplwsapp-d2-1a.staff.local:8080/TPLWS/rest/v1/'

  TplwsClient.configure do |config|
    config.base_url = 'http://tplwsapp-d2-1a.staff.local:8080/TPLWS/rest/v1/'
    config.due_soon = 3 # days to return books
    config.pickup_soon = 3 # days to pick up holds
  end


  helpers do

    # Loads all data needed to bootstrap a full page reload

    def load_user
      branch_data = YAML.load_file('branches.yml')
      user = user(@user_auth)

      checkouts = checkouts(@user_auth)
      due_soon = due_soon_count(checkouts)
      user['circulationSummary']['numberOfDueSoonCheckouts'] = due_soon

      holds = holds(@user_auth)
      pickup_soon = pickup_soon_count(holds)
      user['circulationSummary']['numberOfPickupSoonHolds'] = pickup_soon

      @bootstrapInfo = {"currentUser"=>user}.merge!(branch_data)
      erb :react, :layout => :account_layout
    end
  end

  # General error handling for non json requests

  error TplwsClient::Account::Errors::Users::AuthError do
    logger.error {"TPLWS Error - #{env['sinatra.error'].result.errorCode} - #{env['sinatra.error'].result.errorMessage}"}

    session.clear
    flash[:notice] = "#{env['sinatra.error'].result.errorMessage}:  #{env['sinatra.error'].result.errorMessageDetail}"
    redirect to(settings.app_prefix+'/login/')
  end

  error TplwsClient::Account::Errors::TPLWSError do
    logger.error {"TPLWS Error - #{env['sinatra.error'].result.errorCode} - #{env['sinatra.error'].result.errorMessage}"}

    "I'm sorry Dave, I'm afraid I can't do that - #{env['sinatra.error'].result.errorMessage}:  #{env['sinatra.error'].result.errorMessageDetail}"
  end

  error do
    logger.fatal {'Unhandled error - ' + env['sinatra.error'].message}

    'I\'m sorry Dave, I\'m afraid I can\'t do that - ' + env['sinatra.error'].message
  end

  # Create the auth object for making requests to tplws, actual auth is done lazily

  before do
    pass if ['login'].include? request.path_info.split('/')[2]

    @user_auth ||= TplwsClient::Auth.new(id:session['userID'], auth_token:session['auth_token'], forever_token:session['Remeber-Me'])
  end

  #Login / logout routes

  get "#{settings.app_prefix}/login/?" do
    erb :login
  end

  post "#{settings.app_prefix}/login/?" do

    @user_auth = TplwsClient::Auth.new(barcode:params['card'],pin:params['pin'],stay_logged_in:params.has_key?('rememberme'))

    session['userID'] = @user_auth.id
    session['auth_token'] = @user_auth.auth_token

    response.set_cookie 'Session-ID', {:value=> @user_auth.auth_token, :max_age => "28800", :path => '/'}

    if @user_auth.forever_token != nil
      response.set_cookie 'Remember-Me', {:value=> @user_auth.forever_token, :max_age => "5184000", :path => '/'}
    end

    redirect to(settings.app_prefix+'/')

  end

  get settings.app_prefix+'/logout/?' do
    session.clear

    conn = Faraday.new(:url => TPLWS_URL)
    resp = conn.post "auth/logout" do |req|
      req.headers['Content-Type'] = 'application/json'
      req.body = {:token => @auth_token}.to_json
    end

    response.delete_cookie 'Session-ID'
    response.delete_cookie 'Remember-Me'

    redirect to(settings.app_prefix+'/login/')
  end

  #User routes

  get settings.app_prefix+'/?' do
      load_user
  end

  # Checkout Routes

  get settings.app_prefix+'/checkouts.?:format?' do
    if params['format'] == 'json'
      content_type :json

      begin
        checkouts(@user_auth).to_json
      rescue TplwsClient::Account::Errors::TPLWSError => e
        logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

        status 422
        {errors: ["#{e.result.errorMessage}:  #{e.result.errorMessageDetail}"]}.to_json
      rescue => e
        logger.fatal {"Unhandled error listing checkouts: #{e}"}

        status 500
        {errors: 'Server Error'}.to_json
      end

    else
      load_user
    end
  end

  post settings.app_prefix+'/checkouts/:id/renewal' do
    content_type :json
    begin
      renew(@user_auth, params[:id]).first.to_json
    rescue TplwsClient::Account::Errors::TPLWSError => e
      logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

      status 422
      {errors: [e.message]}.to_json
    rescue => e
      logger.fatal {"Unhandled error renewing checkout: #{e}"}

      status 500
      {errors: 'Server Error'}.to_json
    end
  end

  post settings.app_prefix+'/checkouts/renewals.?:format?' do
    content_type :json
    begin
      renew(@user_auth, params[:ids]).to_json
    rescue TplwsClient::Account::Errors::TPLWSError => e
      logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

      status 500
      {errors: [e.message]}.to_json
    rescue => e
      logger.fatal {"Unhandled error renewing multiple checkouts: #{e}"}

      status 500
      {errors: 'Server Error'}.to_json
    end
  end

  # Holds Routes

  get %r{#{settings.app_prefix}/holds/(ready|pending|transit).?} do
    load_user
  end

  get settings.app_prefix+'/holds.?:format?' do
    if params['format'] == 'json'
      content_type :json

      begin
        holds(@user_auth).to_json
      rescue TplwsClient::Account::Errors::TPLWSError => e
        logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

        status 422
        {errors: [e.result.errorMessage]}.to_json
      rescue => e
        logger.fatal {"Unhandled error listing holds: #{e}"}

        status 500
        {errors: 'Server Error'}.to_json
      end

    else
      load_user
    end
  end

  post settings.app_prefix+'/holds/:id/:action.?:format?' do
    begin

      if params[:action] == 'activate'
        activate_hold(@user_auth, params[:id]).to_json
      elsif params[:action] == 'deactivate'
        deactivate_hold(@user_auth, params[:id]).to_json
      end

    rescue TplwsClient::Account::Errors::TPLWSError => e
      logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

      status 422
      {errors: [e.result.errorMessage]}.to_json
    rescue
      logger.fatal {"Unhandled error changing hold status: #{e}"}

      status 500
      {errors: 'Server Error'}.to_json
    end
  end

  post settings.app_prefix+'/holds/:action.?:format?' do
    content_type :json

    results = []
      if params[:action] == 'activations'
        params[:ids].each do |id|
          begin
            results << activate_hold(@user_auth, id)
          rescue => e
            puts e
          end
        end
      elsif params[:action] == 'deactivations'
        params[:ids].each do |id|
          begin
            results << deactivate_hold(@user_auth, id)
          rescue => e
            puts e
          end
        end
      end
      results.to_json
  end

  delete settings.app_prefix+'/holds/:id.?:format?' do
    begin
      status 204
      cancel_hold(@user_auth, params[:id])
    rescue => e
      logger.fatal {"Unhandled error cancelling hold: #{e}"}

      status 500
      {errors: 'Server Error'}.to_json
    end
  end

  put settings.app_prefix+'/holds/:id.?:format?' do
    content_type :json
    begin
      hold = JSON.parse(request.body.read)
      update_hold(@user_auth, params[:id], {:expiration => hold['expiration'], :pickupLocation => hold['pickupLocation']}).to_json
    rescue TplwsClient::Account::Errors::TPLWSError => e
      logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

      status 422
      {errors: [e.result.errorMessage]}.to_json
    rescue => e
      logger.fatal {"Unhandled error updating hold: #{e}"}

      status 500
      {errors: 'Server Error'}.to_json
    end
  end

  # Charges Routes

  get settings.app_prefix+'/charges.?:format?' do
    if params['format'] == 'json'
      content_type :json

      begin
        charges(@user_auth).to_json
      rescue TplwsClient::Account::Errors::TPLWSError => e
        logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

        status 422
        {errors: [e.result.errorMessage]}.to_json
      rescue => e
        logger.fatal {"Unhandled error getting charges: #{e}"}

        status 500
        {errors: 'Server Error'}.to_json
      end

    else
      load_user
    end
  end

 # Setting Routes

  get settings.app_prefix+'/settings/?' do
    load_user
  end

  post settings.app_prefix+'/settings/change_pin' do
    content_type :json
    begin
      update_pin(@user_auth, params['old_pin'], params['pin']).to_json
    rescue TplwsClient::Account::Errors::TPLWSError => e
      logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}

      status 500
      {errors: [e.result.errorMessage]}.to_json
    rescue => e
      logger.fatal {"Unhandled error changing pin: #{e}"}

      status 500
      {errors: 'Server Error'}.to_json
    end
  end

  post settings.app_prefix+'/settings/change_pref_name' do
    content_type :json
    # change_pref_name(params['preferredName'], @user_auth)
    status 200
  end

  post settings.app_prefix+'/settings/home_branch' do
    content_type :json
    begin
      update_home_branch(@user_auth, params['home_branch']).to_json
    rescue TplwsClient::Account::Errors::TPLWSError => e
      status 500
      logger.error {"TPLWS Error - #{e.result.errorCode} - #{e.result.errorMessage}"}
      {errors: [e.result.errorMessage]}.to_json
    rescue => e
      logger.fatal {"Unhandled error updating home branch: #{e}"}
      status 500
      {errors: 'Server Error'}.to_json
    end

  end

end
