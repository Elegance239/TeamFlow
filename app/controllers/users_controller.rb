class UsersController < ApplicationController
  before_action :authenticate_user!

  # GET /users/:id
  # Returns the user's info including their team (if any)
  def show
    return render json: { error: "Unauthorized" }, status: :forbidden unless current_user.id == params[:id].to_i
    user = User.find(params[:id])
    render json: user.as_json(include: :team).merge(overall_score: user.overall_score)
  end

  # PATCH /users/:id
  # Allows a user to update their own name
  def update
    return render json: { error: "Unauthorized" }, status: :forbidden unless current_user.id == params[:id].to_i
    user = User.find(params[:id])
    if user.update(user_update_params)
      render json: user
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def user_update_params
    params.permit(:name, :skills)
  end
end
