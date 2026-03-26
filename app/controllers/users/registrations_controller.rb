class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  skip_before_action :require_no_authentication, only: [ :create ]

  def create
    team_name = sign_up_params[:team_name].to_s.strip
    if team_name.blank?
      return render json: { errors: [ "Team name can't be blank" ] }, status: :unprocessable_content
    end

    team = Team.find_or_initialize_by(name: team_name)
    if team.new_record? && !team.save
      return render json: { errors: team.errors.full_messages }, status: :unprocessable_content
    end

    resource = build_resource(sign_up_params.except(:team_name))
    resource.team = team
    resource.role ||= team.users.exists? ? :team_member : :team_lead

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

  # If you are looking for the definition of the routes, it is inherited by Devise's implementation here:
  # https://github.com/heartcombo/devise/blob/main/app/controllers/devise/registrations_controller.rb#L17
  # Look for the right file on the left.

  def destroy
    if resource.destroy
      Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
      render json: { message: "Account deleted successfully" }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
    end
  end

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
    params.require(:user).permit(:name, :email, :password, :password_confirmation, :role, :team_name)
  end
end
