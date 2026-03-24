# app/controllers/users/sessions_controller.rb
class Users::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    resource = warden.authenticate(auth_options)

    if resource
      sign_in(resource_name, resource)
      render json: {
        message: "Logged in successfully",
        user: {
          id: resource.id,
          name: resource.name,
          email: resource.email,
          role: resource.role
        }
      }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def destroy
    sign_out current_user
    render json: { message: "Logged out successfully" }, status: :ok
  end
end
