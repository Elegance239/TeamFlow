class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  # If you are looking for the definition of the routes, it is inherited by Devise's implementation here:
  # https://github.com/heartcombo/devise/blob/main/app/controllers/devise/registrations_controller.rb#L17
  # Look for the right file on the left.
  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        message: "Account created successfully",
        user: {
          id: resource.id,
          name: resource.name,
          email: resource.email,
          role: resource.role
        }
      }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
    end
  end

  def sign_up_params
    # Strong Params that are allowed for the sign up form (by default devise only uses email, password, password_confirmation)
    params.require(:user).permit(:name, :email, :password, :password_confirmation, :role)
  end
end
