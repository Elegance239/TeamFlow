# app/controllers/users/passwords_controller.rb
class Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.is_a?(User) && !resource.errors.empty?
      render json: { error: resource.errors.full_messages.join(", ") }, status: :unprocessable_content
    else
      render json: { message: "Password reset email sent" }, status: :ok
    end
  end
end
