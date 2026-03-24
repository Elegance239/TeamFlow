class TeamMembersController < ApplicationController
  before_action :authenticate_user!

  # GET /teams/:team_id/members
  # Lists all members of the team. Only accessible by the team_lead.
  def index
    team = Team.find(params[:team_id])

    unless current_user.team_lead? && current_user.team_id == team.id
      return render json: { error: "Only the team lead can view all members" }, status: :forbidden
    end

    render json: team.users.as_json(only: [ :id, :name, :role ])
  end

  # DELETE /teams/:team_id/members/:id
  # Removes a user from the team (sets team to nil, clears role). Only the team_lead can do this.
  def destroy
    team = Team.find(params[:team_id])

    unless current_user.team_lead? && current_user.team_id == team.id
      return render json: { error: "Only the team lead can remove members" }, status: :forbidden
    end

    member = team.users.find(params[:id])

    if member.id == current_user.id
      return render json: { error: "Team lead cannot remove themselves" }, status: :unprocessable_content
    end

    member.update!(team: nil, role: nil)
    render json: { message: "User removed from team" }
  end

  # POST /teams/:team_id/members
  # Adds a member to a team. Only the team_lead of that team may do this.
  # If existing_user_id is provided, that user is added to the team.
  # Otherwise a new user is created and added to the team.
  def create
    team = Team.find(params[:team_id])

    unless current_user.team_lead? && current_user.team_id == team.id
      return render json: { error: "Only the team lead can add members" }, status: :forbidden
    end

    if params[:existing_user_id].present?
      member = User.find(params[:existing_user_id])
      member.update!(team: team, role: :team_member)
      render json: member
    else
      member = User.new(name: params[:name], team: team, role: :team_member)
      if member.save
        render json: member, status: :created
      else
        render json: { errors: member.errors.full_messages }, status: :unprocessable_content
      end
    end
  end
end
