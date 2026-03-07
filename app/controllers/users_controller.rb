class UsersController < ApplicationController
  # GET /users/:id
  # Returns the user's info including their team (if any)
  def show
    user = User.find(params[:id])
    render json: user.as_json(include: :team)
  end

  # POST /users
  # Creates a new guest user (no team, no role)
  def create
    user = User.new(name: params[:name])
    if user.save
      render json: user, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PATCH /users/:id
  # Allows a user to update their own name
  def update
    user = User.find(params[:id])
    if user.update(name: params[:name])
      render json: user
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end
end
