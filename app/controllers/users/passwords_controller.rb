class Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  # If you are looking for the definition of the routes, it is inherited by Devise's implementation here:
  # https://github.com/heartcombo/devise/blob/main/app/controllers/devise/registrations_controller.rb#L17
  # Look for the right file on the left.
  private

  def respond_with(resource, _opts = {})
    if resource.errors.empty? && resource.respond_to?(:errors)
      render json: { error: resource.errors.full_messages.join(", ") }, status: :unprocessable_entity
    else
      render json: { message: "Password reset email sent" }, status: :ok
    end
  end
end
