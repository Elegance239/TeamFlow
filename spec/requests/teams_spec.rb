require 'rails_helper'

RSpec.describe "Teams", type: :request do
  describe "POST /teams" do
    it "creates a team and makes the requesting user a team_lead" do
      user = User.create!(name: "Alice", email: "alice@test.com", password: "password123", password_confirmation: "password123", team: create(:team), role: :team_member)
      sign_in user

      post "/teams", params: { name: "Dev Team", description: "A dev team" }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["team"]["name"]).to eq("Dev Team")
      expect(json["user"]["role"]).to eq("team_lead")
      expect(json["user"]["team_id"]).to eq(json["team"]["id"])
    end

    it "fails when team name already exists" do
      Team.create!(name: "Dev Team")
      user = User.create!(name: "Bob", email: "bob@test.com", password: "password123", password_confirmation: "password123", team: create(:team), role: :team_member)
      sign_in user

      post "/teams", params: { name: "Dev Team" }

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end
  end

  describe "GET /teams/:id" do
    let(:team) { Team.create!(name: "Dev Team") }
    let(:lead) { User.create!(name: "Lead", team: team, role: :team_lead, email: "lead@test.com", password: "password123", password_confirmation: "password123") }
    let(:member) { User.create!(name: "Member", team: team, role: :team_member, email: "member@test.com", password: "password123", password_confirmation: "password123") }

    it "returns team info with team leads for a team member" do
      lead; member  # ensure both are created
      sign_in member

      get "/teams/#{team.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Dev Team")
      expect(json["team_leads"].map { |l| l["id"] }).to include(lead.id)
    end

    it "returns team info for the team lead too" do
      sign_in lead

      get "/teams/#{team.id}"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("Dev Team")
    end

    it "forbids a user not in the team from viewing it" do
      outsider = User.create!(name: "Outsider", email: "outsider@test.com", password: "password123", password_confirmation: "password123", team: create(:team), role: :team_member)
      sign_in outsider

      get "/teams/#{team.id}"

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /teams/:id" do
    let(:team) { Team.create!(name: "Dev Team", description: "Old desc") }
    let(:lead)   { User.create!(name: "Lead", team: team, role: :team_lead, email: "lead@test.com", password: "password123", password_confirmation: "password123") }
    let(:member) { User.create!(name: "Member", team: team, role: :team_member, email: "member@test.com", password: "password123", password_confirmation: "password123") }

    it "allows the team lead to update the description" do
      sign_in lead

      patch "/teams/#{team.id}", params: { description: "New desc" }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["description"]).to eq("New desc")
      expect(team.reload.description).to eq("New desc")
    end

    it "forbids a team member from updating the description" do
      sign_in member

      patch "/teams/#{team.id}", params: { description: "Hacked" }

      expect(response).to have_http_status(:forbidden)
    end

    it "forbids an outsider from updating the description" do
      outsider = User.create!(name: "Outsider", email: "outsider2@test.com", password: "password123", password_confirmation: "password123", team: create(:team), role: :team_member)
      sign_in outsider

      patch "/teams/#{team.id}", params: { description: "Hacked" }

      expect(response).to have_http_status(:forbidden)
    end
  end
end
