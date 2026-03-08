require 'rails_helper'

RSpec.describe "Teams", type: :request do
  describe "POST /teams" do
    it "creates a team and makes the requesting user a team_lead" do
      user = User.create!(name: "Alice")

      post "/teams", params: { user_id: user.id, name: "Dev Team", description: "A dev team" }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["team"]["name"]).to eq("Dev Team")
      expect(json["user"]["role"]).to eq("team_lead")
      expect(json["user"]["team_id"]).to eq(json["team"]["id"])
    end

    it "fails when team name already exists" do
      Team.create!(name: "Dev Team")
      user = User.create!(name: "Bob")

      post "/teams", params: { user_id: user.id, name: "Dev Team" }

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end
  end

  describe "GET /teams/:id" do
    let(:team) { Team.create!(name: "Dev Team") }
    let(:lead) { User.create!(name: "Lead", team: team, role: :team_lead) }
    let(:member) { User.create!(name: "Member", team: team, role: :team_member) }

    it "returns team info with team leads for a team member" do
      lead; member  # force creation before the request
      get "/teams/#{team.id}", params: { user_id: member.id }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Dev Team")
      expect(json["team_leads"].map { |l| l["id"] }).to include(lead.id)
    end

    it "returns team info for the team lead too" do
      get "/teams/#{team.id}", params: { user_id: lead.id }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("Dev Team")
    end

    it "forbids a user not in the team from viewing it" do
      outsider = User.create!(name: "Outsider")

      get "/teams/#{team.id}", params: { user_id: outsider.id }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /teams/:id" do
    let(:team) { Team.create!(name: "Dev Team", description: "Old desc") }
    let(:lead)   { User.create!(name: "Lead", team: team, role: :team_lead) }
    let(:member) { User.create!(name: "Member", team: team, role: :team_member) }

    it "allows the team lead to update the description" do
      patch "/teams/#{team.id}", params: { user_id: lead.id, description: "New desc" }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["description"]).to eq("New desc")
      expect(team.reload.description).to eq("New desc")
    end

    it "forbids a team member from updating the description" do
      patch "/teams/#{team.id}", params: { user_id: member.id, description: "Hacked" }

      expect(response).to have_http_status(:forbidden)
    end

    it "forbids an outsider from updating the description" do
      outsider = User.create!(name: "Outsider")

      patch "/teams/#{team.id}", params: { user_id: outsider.id, description: "Hacked" }

      expect(response).to have_http_status(:forbidden)
    end
  end
end
