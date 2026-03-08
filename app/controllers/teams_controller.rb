class TeamsController < ApplicationController
  # GET /teams/:id
  # Returns team info. Any member of the team can view it, including the list of team leads.
  def show
    team = Team.find(params[:id])
    requester = User.find(params[:user_id])

    unless requester.team_id == team.id
      return render json: { error: "You are not a member of this team" }, status: :forbidden
    end

    team_leads = team.users.where(role: :team_lead)
    render json: team.as_json.merge(team_leads: team_leads.as_json(only: [ :id, :name ]))
  end

  # POST /teams
  # Creates a new team. The requesting user becomes the team_lead.
  # Fails if team name already exists.
  def create
    requester = User.find(params[:user_id])
    team = Team.new(name: params[:name], description: params[:description])

    if team.save
      requester.update!(team: team, role: :team_lead)
      render json: { team: team, user: requester }, status: :created
    else
      render json: { errors: team.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PATCH /teams/:id
  # Updates team description. Only the team_lead of that team may do this.
  def update
    team = Team.find(params[:id])
    requester = User.find(params[:user_id])

    unless requester.team_lead? && requester.team_id == team.id
      return render json: { error: "Only the team lead can update the team description" }, status: :forbidden
    end

    if team.update(description: params[:description])
      render json: team
    else
      render json: { errors: team.errors.full_messages }, status: :unprocessable_content
    end
  end
end
