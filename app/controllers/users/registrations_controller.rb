class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  skip_before_action :require_no_authentication, only: [ :create ]

  def create
    team_name = sign_up_params[:team_name]
    if team_name.nil?
      return render json: { errors: [ "Team name can't be blank" ] }, status: :unprocessable_content
    end

    is_team_lead = sign_up_params[:role] == "team_lead" ? true : false
    create_new = ActiveModel::Type::Boolean.new.cast(sign_up_params[:create_new])
    team = Team.find_by(name: team_name)

    if team.nil?
      if is_team_lead && create_new
        team = Team.new(name: team_name)
        unless team.save
          return render json: { errors: team.errors.full_messages }, status: :unprocessable_content
        end
      else
        # Any other case gives a 422
        return render json: { errors: [ "Department name does not exist" ] }, status: :unprocessable_content
      end
    else
      # Team already exists 422
      if is_team_lead && create_new
        # Team Lead tried to create an already existing department
        return render json: { errors: [ "Department name has already been taken!" ] }, status: :unprocessable_content
      end
    end

    resource = build_resource(sign_up_params.except(:team_name, :create_new))
    resource.team = team
    resource.role = is_team_lead ? :team_lead : :team_member

    if resource.save
      sign_up(resource_name, resource)
      render json: {
        message: "Account created successfully",
        user: {
          id: resource.id,
          name: resource.name,
          email: resource.email,
          role: resource.role,
          team_id: resource.team_id
        }
      }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    resource = current_user

    if resource.update(account_update_params)
      render json: {
        message: "Account updated successfully",
        user: {
          id: resource.id,
          name: resource.name,
          email: resource.email,
          role: resource.role,
          team_id: resource.team_id
        }
      }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
    end
  end

  private
  def sign_up_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation, :role, :team_name, :create_new)
  end

  def account_update_params
    params.require(:user).permit(:email, :current_password)
  end
end
