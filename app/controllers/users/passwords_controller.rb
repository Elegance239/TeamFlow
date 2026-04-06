# app/controllers/users/passwords_controller.rb
class Users::PasswordsController < Devise::PasswordsController
  respond_to :json
  skip_before_action :require_no_authentication, only: [:change]

  # PATCH /users/password/change
  def change
    user = current_user
    unless user.valid_password?(params[:current_password])
      return render json: { error: "Current password is incorrect" }, status: :unprocessable_entity
    end

    if user.update(password: params[:password], password_confirmation: params[:password_confirmation])
      bypass_sign_in(user)
      render json: { message: "Password updated successfully" }, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def respond_with(resource, _opts = {})
    if resource.is_a?(User) && !resource.errors.empty?
      render json: { error: resource.errors.full_messages.join(", ") }, status: :unprocessable_content
    else
      render json: { message: "Password reset email sent" }, status: :ok
    end
  end
end
