require 'rails_helper'

RSpec.describe "Users", type: :request do
  describe "POST /users" do
    it "creates a guest user with no team and no role" do
      post "/users", params: { name: "Alice" }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Alice")
      expect(json["team_id"]).to be_nil
      expect(json["role"]).to be_nil
    end

    it "returns an error when name is missing" do
      post "/users", params: {}

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to be_present
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

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
