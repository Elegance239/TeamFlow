class UsersController < ApplicationController
  before_action :authenticate_user!

  # GET /users/:id
  # Returns the user's info including their team (if any)
  def show
    return render json: { error: "Unauthorized" }, status: :forbidden unless current_user.id == params[:id].to_i
    user = User.find(params[:id])
    render json: user.as_json(include: :team).merge(overall_score: user.overall_score)
  end

  # GET /users/me
  def me
    render json: current_user.as_json(include: :team).merge(overall_score: current_user.overall_score)
  end

  # PATCH /users/:id
  # Allows a user to update their own name, email, skills, password
  def update
    return render json: { error: "Unauthorized" }, status: :forbidden unless current_user.id == params[:id].to_i

    user = User.find(params[:id])
    update_attrs = params.permit(:name, :email, :skills, :password, :password_confirmation).to_h

    if update_attrs["password"].blank?
      update_attrs.delete("password")
      update_attrs.delete("password_confirmation")
    end

    if user.update(update_attrs)
      render json: user.as_json(include: :team).merge(overall_score: user.overall_score)
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end
end
