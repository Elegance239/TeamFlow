class SessionsController < ApplicationController
  # This allows your React form to POST to this controller
  # without needing the Rails Authenticity Token for now.
  skip_before_action :verify_authenticity_token, only: [ :create ]

  def new
    # This will render your React Sign In page
  end

  def create
    # Use params[:email] and params[:password] which match the 'name' attributes in your MUI TextFields
    user = User.find_by(email: params[:email])

    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to root_path, notice: "Logged in!"
    else
      # Fixed the typo here
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_path, notice: "Logged out!"
  end
end
