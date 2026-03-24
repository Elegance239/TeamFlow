require 'rails_helper'

RSpec.describe "Users", type: :request do
  describe "POST /users" do
    it "creates a guest user with no team and no role" do
      post "/users", params: {
        user: {
          name: "Alice",
          email: "alice-test-#{SecureRandom.hex(4)}@test.com",
          password: "alicepassword123",
          password_confirmation: "alicepassword123"
        }
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["user"]["name"]).to eq("Alice")
      expect(json["user"]["team_id"]).to be_nil
      expect(json["user"]["role"]).to be_nil
    end

    it "returns an error when name is missing" do
      post "/users", params: {
        user: {
          email: "noname@test.com",
          password: "noname123",
          password_confirmation: "noname123"
        }
      }

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end

    it "rejects registration with invalid email format" do
      post "/users", params: {
        user: {
          name: "Bad",
          email: "not-an-email",
          password: "password123",
          password_confirmation: "password123"
          }
        }
      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Email is invalid")
    end

    it "rejects duplicate email" do
      User.create!(name: "Existing", email: "duplicate@example.com", password: "password123", password_confirmation: "password123")
      post "/users", params: {
        user: {
          name: "Duplicate",
          email: "duplicate@example.com",
          password: "password123",
          password_confirmation: "password123"
          }
        }
      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Email has already been taken")
    end

    it "rejects mismatched passwords" do
      post "/users", params: {
        user: {
          name: "Mismatch",
          email: "mismatch@example.com",
          password: "password123",
          password_confirmation: "wrong"
          }
        }
      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json["errors"]).to include("Password confirmation doesn't match Password")
    end
  end

  describe "POST /users/sign_in" do
    let!(:user) { User.create!(name: "Login Test", email: "login@example.com", password: "password123", password_confirmation: "password123", role: :team_member) }

    it "logs in successfully with correct credentials" do
      post "/users/sign_in", params: {
        user: {
          email: user.email,
          password: "password123"
        }
      }

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
        }
      expect(response).to have_http_status(:unauthorized)
      json = JSON.parse(response.body)
      expect(json["error"]).to eq("Invalid email or password")
    end
  end

  describe "POST /users/password" do
    let!(:user) { User.create!(name: "Forgot", email: "forgot@example.com", password: "password123", password_confirmation: "password123") }

    it "sends reset password instructions" do
      post "/users/password", params: { user: { email: user.email } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Password reset email sent")
    end
  end
  describe "GET /users/:id" do
    it "returns user info including their team" do
      team = Team.create!(name: "Dev Team")
      user = User.create!(name: "Alice", team: team, role: :team_member)

      get "/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Alice")
      expect(json["team"]["name"]).to eq("Dev Team")
    end

    it "returns user info with nil team for guest user" do
      user = User.create!(name: "Guest")

      get "/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["team"]).to be_nil
    end
  end

  describe "PATCH /users/:id" do
    it "allows a user to update their own name" do
      user = User.create!(name: "OldName")

      patch "/users/#{user.id}", params: { name: "NewName" }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("NewName")
      expect(user.reload.name).to eq("NewName")
    end

    it "returns an error when new name is blank" do
      user = User.create!(name: "Alice")

      patch "/users/#{user.id}", params: { name: "" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
