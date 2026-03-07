require 'rails_helper'

RSpec.describe "TeamMembers", type: :request do
  let(:team)   { Team.create!(name: "Dev Team") }
  let(:lead)   { User.create!(name: "Lead", team: team, role: :team_lead) }
  let(:member) { User.create!(name: "Member", team: team, role: :team_member) }

  describe "GET /teams/:team_id/members" do
    it "allows team lead to list all members" do
      lead; member  # ensure both are created

      get "/teams/#{team.id}/members", params: { user_id: lead.id }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      names = json.map { |u| u["name"] }
      expect(names).to include("Lead", "Member")
    end

    it "forbids a regular member from listing members" do
      get "/teams/#{team.id}/members", params: { user_id: member.id }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /teams/:team_id/members" do
    it "allows team lead to add an existing user to the team" do
      guest = User.create!(name: "Guest")

      post "/teams/#{team.id}/members", params: { user_id: lead.id, existing_user_id: guest.id }

      expect(response).to have_http_status(:ok)
      guest.reload
      expect(guest.team).to eq(team)
      expect(guest.role).to eq("team_member")
    end

    it "allows team lead to create a new user and add them to the team" do
      post "/teams/#{team.id}/members", params: { user_id: lead.id, name: "New Member" }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("New Member")
      expect(json["team_id"]).to eq(team.id)
      expect(json["role"]).to eq("team_member")
    end

    it "forbids a regular member from adding members" do
      guest = User.create!(name: "Guest")

      post "/teams/#{team.id}/members", params: { user_id: member.id, existing_user_id: guest.id }

      expect(response).to have_http_status(:forbidden)
    end

    it "returns error when creating new member without a name" do
      post "/teams/#{team.id}/members", params: { user_id: lead.id, name: "" }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /teams/:team_id/members/:id" do
    it "allows team lead to remove a member from the team" do
      delete "/teams/#{team.id}/members/#{member.id}", params: { user_id: lead.id }

      expect(response).to have_http_status(:ok)
      member.reload
      expect(member.team_id).to be_nil
      expect(member.role).to be_nil
    end

    it "forbids team lead from removing themselves" do
      delete "/teams/#{team.id}/members/#{lead.id}", params: { user_id: lead.id }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "forbids a regular member from removing anyone" do
      other = User.create!(name: "Other", team: team, role: :team_member)

      delete "/teams/#{team.id}/members/#{other.id}", params: { user_id: member.id }

      expect(response).to have_http_status(:forbidden)
    end
  end
end
