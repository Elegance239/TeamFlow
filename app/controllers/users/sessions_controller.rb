class Users::SessionsController < Devise::SessionsController
  respond_to :json

  # If you are looking for the definition of the routes, it is inherited by Devise's implementation here:
  # https://github.com/heartcombo/devise/blob/main/app/controllers/devise/registrations_controller.rb#L17
  # Look for the right file on the left.
  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
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
end
