require 'rails_helper'

RSpec.describe "TeamMembers", type: :request do
  let(:team)   { Team.create!(name: "Dev Team") }
  let(:lead)   { User.create!(name: "Lead", email: "lead@example.com", password: "password", password_confirmation: "password", team: team, role: :team_lead) }
  let(:member) { User.create!(name: "Member", email: "member@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member) }

  describe "GET /teams/:team_id/members" do
    it "allows team lead to list all members" do
      lead; member  # ensure both are created
      sign_in lead

      get "/teams/#{team.id}/members"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      names = json.map { |u| u["name"] }
      expect(names).to include("Lead", "Member")
    end

    it "forbids a regular member from listing members" do
      sign_in member

      get "/teams/#{team.id}/members"

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /teams/:team_id/members" do
    it "allows team lead to add an existing user to the team" do
      sign_in lead
      guest = User.create!(name: "Guest", email: "guest@example.com", password: "password", password_confirmation: "password")

      post "/teams/#{team.id}/members", params: { existing_user_id: guest.id }

      expect(response).to have_http_status(:ok)
      guest.reload
      expect(guest.team).to eq(team)
      expect(guest.role).to eq("team_member")
    end

    it "allows team lead to create a new user and add them to the team" do
      sign_in lead

      post "/teams/#{team.id}/members", params: { name: "New Member" }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("New Member")
      expect(json["team_id"]).to eq(team.id)
      expect(json["role"]).to eq("team_member")
    end

    it "forbids a regular member from adding members" do
      sign_in member
      guest = User.create!(name: "Guest", email: "guest@example.com", password: "password", password_confirmation: "password")

      post "/teams/#{team.id}/members", params: { existing_user_id: guest.id }

      expect(response).to have_http_status(:forbidden)
    end

    it "returns error when creating new member without a name" do
      sign_in lead

      post "/teams/#{team.id}/members", params: { name: "" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /teams/:team_id/members/:id" do
    it "allows team lead to remove a member from the team" do
      sign_in lead

      delete "/teams/#{team.id}/members/#{member.id}"

      expect(response).to have_http_status(:ok)
      member.reload
      expect(member.team_id).to be_nil
      expect(member.role).to be_nil
    end

    it "forbids team lead from removing themselves" do
      sign_in lead

      delete "/teams/#{team.id}/members/#{lead.id}"

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "forbids a regular member from removing anyone" do
      sign_in member
      other = User.create!(name: "Other", email: "other@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member)

      delete "/teams/#{team.id}/members/#{other.id}"

      expect(response).to have_http_status(:forbidden)
    end
  end
end
