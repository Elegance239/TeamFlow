require 'rails_helper'

RSpec.describe "Users", type: :request do
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

  describe "POST /users" do
    it "creates a new account" do
      post "/users",
           params: {
             user: {
               name: "Signup User",
               email: "signup@example.com",
               password: "password123",
               password_confirmation: "password123",
               role: :team_member
             }
           },
           headers: json_headers

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body).dig("user", "email")).to eq("signup@example.com")
    end
  end

  describe "POST /users/sign_in" do
    let!(:user) { create(:user, name: "Login Test", email: "login@example.com", role: :team_member) }

    it "logs in successfully with correct credentials" do
      post "/users/sign_in",
           params: { user: { email: user.email, password: "password123" } },
           headers: json_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Logged in successfully")
      expect(json["user"]["email"]).to eq(user.email)
    end

    it "rejects login with wrong password" do
      post "/users/sign_in",
           params: { user: { email: user.email, password: "wrong" } },
           headers: json_headers

      expect(response).to have_http_status(:unauthorized)
      json = JSON.parse(response.body)
      expect(json["error"]).to eq("Invalid email or password")
    end
  end

  describe "DELETE /users/sign_out" do
    let!(:user) { create(:user, name: "Logout Test", email: "logout@example.com") }

    it "logs out the current user" do
      post "/users/sign_in",
           params: { user: { email: user.email, password: "password123" } },
           headers: json_headers
      expect(response).to have_http_status(:ok)

      delete "/users/sign_out", headers: json_headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Logged out successfully")
    end
  end

  describe "POST /users/password" do
    let!(:user) { create(:user, name: "Forgot", email: "forgot@example.com") }

    it "sends reset password instructions" do
      post "/users/password",
           params: { user: { email: user.email } },
           headers: json_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Password reset email sent")
    end

    it "returns 422 when email is not found" do
      post "/users/password",
           params: { user: { email: "missing@example.com" } },
           headers: json_headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["error"]).to be_present
    end
  end

  describe "PATCH /users/password" do
    let!(:user) { create(:user, email: "reset@example.com") }

    it "resets password with a valid reset token" do
      raw_token, enc_token = Devise.token_generator.generate(User, :reset_password_token)
      user.update!(reset_password_token: enc_token, reset_password_sent_at: Time.current)

      patch "/users/password",
            params: {
              user: {
                reset_password_token: raw_token,
                password: "newpassword123",
                password_confirmation: "newpassword123"
              }
            },
            headers: json_headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /users (Devise account update)" do
    let!(:user) { create(:user, name: "Edit Me", email: "edit-me@example.com") }

    it "updates account email for authenticated user" do
      post "/users/sign_in",
           params: { user: { email: user.email, password: "password123" } },
           headers: json_headers
      expect(response).to have_http_status(:ok)

      patch "/users",
            params: {
              user: {
                email: "updated-#{SecureRandom.hex(3)}@example.com",
                current_password: "password123"
              }
            },
            headers: json_headers

      expect(response).to have_http_status(:created)
      expect(user.reload.email).to match(/updated-.*@example.com/)
    end
  end

  describe "GET /users/:id" do
    it "returns user info including their team" do
      team = create(:team, name: "Dev Team")
      user = create(:user, :team_member, name: "Alice", team: team)

      sign_in user
      get "/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Alice")
      expect(json["team"]["name"]).to eq("Dev Team")
    end

    it "returns user's overall_score" do
      team = create(:team, name: "Score Team")
      user = create(:user, :team_member, name: "Scorer", team: team)
      other_user = create(:user, :team_member, name: "Other", team: team)

      Task.create!(due_date: Date.today + 5, team: team, created_by: other_user.id, points: 4, current_state: Task::COMPLETED, completed_by_id: user.id)
      Task.create!(due_date: Date.today + 6, team: team, created_by: other_user.id, points: 6, current_state: Task::COMPLETED, completed_by_id: user.id)
      Task.create!(due_date: Date.today + 7, team: team, created_by: other_user.id, points: 8, current_state: Task::COMPLETED, completed_by_id: other_user.id)

      sign_in user
      get "/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["overall_score"]).to eq(10)
    end

    it "returns user info with nil team for guest user" do
      user = create(:user, :guest, name: "Guest")

      sign_in user
      get "/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["team"]).to be_nil
    end
  end

  describe "PATCH /users/:id" do
    it "allows a user to update their own name" do
      user = create(:user, name: "OldName")

      sign_in user
      patch "/users/#{user.id}", params: { name: "NewName" }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("NewName")
      expect(user.reload.name).to eq("NewName")
    end

    it "returns an error when new name is blank" do
      user = create(:user, name: "Alice")

      sign_in user
      patch "/users/#{user.id}", params: { name: "" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /users" do
    it "deletes the current user account" do
      user = create(:user, name: "DeleteMe")

      sign_in user
      delete "/users", headers: json_headers

      expect([ 200, 204, 302 ].include?(response.status)).to be true
      expect(User.find_by(id: user.id)).to be_nil
    end

    it "prevents deletion of a user with created tasks" do
      team = create(:team, name: "Team A")
      user = create(:user, :team_lead, name: "HasTasks", team: team)

      Task.create!(due_date: Date.today + 5, team: team, created_by: user.id, points: 1)

      sign_in user
      delete "/users", headers: json_headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(User.find_by(id: user.id)).not_to be_nil
    end
  end
end
