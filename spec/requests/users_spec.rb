require 'rails_helper'

RSpec.describe "Users", type: :request do
  let(:json_headers) { { 'ACCEPT' => 'application/json' } }

  describe "POST /users/sign_in" do
    let!(:user) { User.create!(name: "Login Test", email: "login@example.com", password: "password123", password_confirmation: "password123", role: :team_member) }

    it "logs in successfully with correct credentials" do
      post "/users/sign_in", params: {
        user: {
          email: user.email,
          password: "password123"
        }
      }, headers: json_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Logged in successfully")
      expect(json["user"]["email"]).to eq(user.email)
    end

    it "rejects login with wrong password" do
      post "/users/sign_in", params: {
        user: {
          email: user.email,
          password: "wrong"
          }
        }, headers: json_headers
      expect(response).to have_http_status(:unauthorized)
      json = JSON.parse(response.body)
      expect(json["error"]).to eq("Invalid email or password")
    end
  end

  describe "DELETE /users/sign_out" do
    let!(:user) { User.create!(name: "Logout Test", email: "logout@example.com", password: "password123", password_confirmation: "password123") }

    it "logs out the current user" do
      post "/users/sign_in", params: { user: { email: user.email, password: "password123" } }, headers: json_headers
      expect(response).to have_http_status(:ok)

      delete "/users/sign_out", headers: json_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Logged out successfully")
    end
  end

  describe "POST /users/password" do
    let!(:user) { User.create!(name: "Forgot", email: "forgot@example.com", password: "password123", password_confirmation: "password123") }

    it "sends reset password instructions" do
      post "/users/password", params: { user: { email: user.email } }, headers: json_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Password reset email sent")
    end
  end

  describe "PATCH /users (Devise account update)" do
    let!(:user) { User.create!(name: "Edit Me", email: "edit-me@example.com", password: "password123", password_confirmation: "password123") }

    it "updates account email for authenticated user" do
      post "/users/sign_in", params: { user: { email: user.email, password: "password123" } }, headers: json_headers
      expect(response).to have_http_status(:ok)

      patch "/users", params: {
        user: {
          email: "updated-#{SecureRandom.hex(3)}@example.com",
          current_password: "password123"
        }
      }, headers: json_headers

      expect(response).to have_http_status(:created)
      expect(user.reload.email).to match(/updated-.*@example.com/)
    end
  end

  describe "GET /users/:id" do
    it "returns user info including their team" do
      team = Team.create!(name: "Dev Team")
      user = User.create!(name: "Alice", email: "alice@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member)
      sign_in user

      get "/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Alice")
      expect(json["team"]["name"]).to eq("Dev Team")
    end

    it "returns user info with nil team for guest user" do
      user = User.create!(name: "Guest", email: "guest@example.com", password: "password", password_confirmation: "password")
      sign_in user

      get "/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["team"]).to be_nil
    end
  end

  describe "PATCH /users/:id" do
    it "allows a user to update their own name" do
      user = User.create!(name: "OldName", email: "user@example.com", password: "password", password_confirmation: "password")
      sign_in user

      patch "/users/#{user.id}", params: { name: "NewName" }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("NewName")
      expect(user.reload.name).to eq("NewName")
    end

    it "returns an error when new name is blank" do
      user = User.create!(name: "Alice", email: "alice@example.com", password: "password", password_confirmation: "password")
      sign_in user

      patch "/users/#{user.id}", params: { name: "" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /users" do
    it "deletes the current user account" do
      user = User.create!(name: "DeleteMe", email: "delete@example.com", password: "password", password_confirmation: "password")
      sign_in user

      delete "/users", headers: json_headers

      # Devise may return 204, 200, or other success codes depending on configuration
      expect([200, 204, 302].include?(response.status)).to be true
      expect(User.find_by(id: user.id)).to be_nil
    end

    it "prevents deletion of a user with created tasks" do
      user = User.create!(name: "HasTasks", email: "hastasks@example.com", password: "password", password_confirmation: "password", role: :team_lead, team: Team.create!(name: "Team A"))
      Task.create!(due_date: Date.today + 5, team: user.team, created_by: user.id, points: 1)
      sign_in user

      delete "/users", headers: json_headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(User.find_by(id: user.id)).not_to be_nil
    end
  end
end
